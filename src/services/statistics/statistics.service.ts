import { errors } from "@elastic/elasticsearch";
import { SearchTotalHits } from "@elastic/elasticsearch/lib/api/types";
import { basename, dirname } from "path";
import { getLogger } from "../../logger/logger";
import * as EM from "../../model/elastic.models";
import * as RequestModels from "../../model/request.models";
import * as RM from "../../model/response.models";
import { multiSearch, searchDocuments } from "../elastic/elastic.service";
import * as subscriptionService from "../subscription/subscription.service";
import * as cacheService from "./cache/cache.service";
import * as QueryBuilder from "./queryBuilder.service";

const logger = getLogger(
  `${basename(dirname(__filename))}/${basename(__filename)}`
);

let timestampFieldExistsInGeneratedShortUrl: boolean = true;
let timestampFieldExistsInUrlStatistics: boolean = true;

export const getSummaryStatistics = async (
  request: RequestModels.DashboardRequest
): Promise<RM.StatisticsResponse> => {
  const { requestId, userId } = request;

  logger.info(`Usage statistics request received for userId ${userId}`, {
    requestId,
  });

  try {
    const cached = await cacheService.getCachedSummaryStatistics(request);

    if (cached) {
      return cached;
    }

    const statsIndexName: string = process.env["ELASTIC_STATS_INDEX_NAME"]!;
    const createIndexName: string = process.env["ELASTIC_CREATE_INDEX_NAME"]!;

    const dashboardQuery = QueryBuilder.buildDashboardQuery(
      request,
      createIndexName,
      statsIndexName
    );

    const searchResponse: any = await multiSearch(
      statsIndexName!,
      dashboardQuery
    );

    const totalHits = (
      searchResponse.responses[0].aggregations?.total_hits as any
    ).value;

    const currentDayHitsCount = (
      searchResponse.responses[0].aggregations?.current_day_hits as any
    ).doc_count;

    const prevDayHitsCount = (
      searchResponse.responses[0].aggregations?.prev_day_hits as any
    ).doc_count;

    const averageRedirectDuration: number = parseFloat(
      (
        (searchResponse.responses[0].aggregations?.avg_redirect_duration as any)
          .value as number
      )?.toFixed(2)
    );

    const currentDayUrlsCreated: number =
      searchResponse.responses[1].hits.total.value;

    const prevDayUrlsCreated: number =
      searchResponse.responses[2].hits.total.value;

    const prevSevenDaysHits: RM.PerDayHitStats[] = extractPrevSevenDaysHits(
      searchResponse.responses[3]
    );

    const lifetimeStats: RM.DashboardApiStat[] = [
      {
        id: "lifetime__total__clicks",
        key: "Total Clicks",
        value: totalHits,
        suffix: "clicks",
      },
      {
        id: "lifetime__avg__redirect__time",
        key: "Average Redirect Time",
        value: averageRedirectDuration
          ? `${averageRedirectDuration.toFixed(2)}`
          : "0",
        suffix: "ms",
      },
    ];

    const currentDayStats: RM.DashboardApiStat[] = [
      {
        id: "day__total__clicks",
        key: "Current Day",
        value: currentDayHitsCount,
        suffix: "clicks",
      },
      {
        id: "day__new__links",
        key: "Current Day",
        value: currentDayUrlsCreated,
        suffix: "links",
      },
    ];

    const prevDayStats: RM.DashboardApiStat[] = [
      {
        id: "day__total__clicks",
        key: "Previous Day",
        value: prevDayHitsCount,
        suffix: "clicks",
      },
      {
        id: "day__new__links",
        key: "Previous Day",
        value: prevDayUrlsCreated,
        suffix: "links",
      },
    ];

    const response: RM.DashboardResponse = {
      status_code: 200,
      lifetime_stats: lifetimeStats,
      current_day_stats: currentDayStats,
      prev_seven_days_hits: prevSevenDaysHits,
      prev_day_stats: prevDayStats,
    };

    await cacheService.setCachedSummaryStatistics(request, response);

    return response;
  } catch (err: any) {
    logger.error(`Error fetching summary statistics`, { err, requestId });

    const errorResponse: RM.ErrorResponse = {
      status_code: 500,
      errors: ["Internal Server Error"],
      message: "Internal Server Error",
    };

    return errorResponse;
  }
};

export const getGeneratedShortUrls = async (
  request: RequestModels.GeneratedShortUrlsRequest
): Promise<RM.StatisticsResponse> => {
  const { requestId, userId } = request;

  logger.info(`Received generated short URLs request for userId ${userId}`, {
    requestId,
  });

  const cached = await cacheService.getCachedGeneratedShortUrls(request);

  if (cached) {
    return cached;
  }

  try {
    const elasticCreateIndexName: string =
      process.env["ELASTIC_CREATE_INDEX_NAME"]!;

    const query = QueryBuilder.buildGeneratedShortUrlsQuery(
      request,
      timestampFieldExistsInGeneratedShortUrl
    );

    const searchResponse = await searchDocuments(elasticCreateIndexName, query);

    timestampFieldExistsInGeneratedShortUrl = true;

    if (!searchResponse) {
      throw new Error("Document search failed");
    }

    const generatedShortUrlsResp: EM.GeneratedUrlResp =
      searchResponse.hits as EM.GeneratedUrlResp;

    const __urls: RM.UrlMetadata[] = [];

    generatedShortUrlsResp.hits.forEach((url) => {
      const _url: RM.UrlMetadata = {
        original_url: url._source.originalUrl,
        short_url: url._source.shortUrl,
        created_at: new Date(url._source.createdAt),
        ip_address: url._source.ipAddress,
      };

      __urls.push(_url);
    });

    const response: RM.GeneratedShortUrlsResponse = {
      total_records: generatedShortUrlsResp.total.value,
      next_offset: request.offset + 1,
      urls: __urls,
    };

    await cacheService.setCachedGeneratedShortUrls(request, response);

    return response;
  } catch (error: any) {
    if (isMissingTimestampFieldToSortError(error)) {
      timestampFieldExistsInGeneratedShortUrl = false;
      logger.warn(
        "No timestamp field found for sorting. Sending fallback response",
        {
          requestId,
        }
      );
      const response: RM.GeneratedShortUrlsResponse = {
        total_records: 0,
        next_offset: request.offset + 1,
        urls: [],
      };
      return response;
    }

    logger.error(`Error fetching generated short URLs`, { error, requestId });

    const errorResponse: RM.ErrorResponse = {
      status_code: 500,
      errors: ["Internal Server Error"],
      message: "Internal Server Error",
    };

    return errorResponse;
  }
};

export const getPopularUrlsStatistics = async (
  request: RequestModels.PopularUrlsRequest
): Promise<RM.StatisticsResponse> => {
  const { requestId, userId } = request;

  logger.info(`Received popular URL statistics request for userId ${userId}`, {
    requestId,
  });

  const cached = await cacheService.getCachedPopularUrls(request);

  if (cached) {
    return cached;
  }

  try {
    const elasticStatsIndexName: string =
      process.env["ELASTIC_STATS_INDEX_NAME"]!;
    const popularUrlQuery = QueryBuilder.buildPopularUrlQuery(request);

    const searchResponse = await searchDocuments(
      elasticStatsIndexName,
      popularUrlQuery
    );

    if (!searchResponse) {
      throw new Error("Document search failed");
    }

    const topUrlsAggregation: EM.PopularUrlResponseKey[] = (
      searchResponse.aggregations?.top_popular_urls as any
    ).buckets;

    const urls: RM.PopularUrlKey[] = [];

    if (topUrlsAggregation && topUrlsAggregation.length > 0) {
      for (const popularUrl of topUrlsAggregation) {
        const url: RM.PopularUrlKey = {
          short_url: popularUrl.key,
          hits_count: popularUrl.doc_count,
          original_url:
            popularUrl.original_url?.hits?.hits[0]?._source?.originalUrl,
        };
        urls.push(url);
      }
    }

    const popularUrlResponse: RM.PopularUrlStatisticsResponse = {
      popular_urls: urls,
    };

    await cacheService.setCachedPopularUrls(request, popularUrlResponse);

    return popularUrlResponse;
  } catch (error: any) {
    logger.error(`Error fetching popular URLs`, { error, requestId });

    const errorResponse: RM.ErrorResponse = {
      status_code: 500,
      errors: ["Internal Server Error"],
      message: "Internal Server Error",
    };

    return errorResponse;
  }
};

export const getUrlStatistics = async (
  request: RequestModels.UrlMetricsRequest
): Promise<RM.StatisticsResponse> => {
  const { requestId, shortUrl } = request;

  logger.info(`Received URL statistics request for shortUrl ${shortUrl}`, {
    requestId,
  });

  const isAllowed: boolean =
    await subscriptionService.isUserAllowedToAccessResource(
      request.requestId ?? null,
      request.userId,
      "url"
    );

  if (!isAllowed) {
    const response: RM.ErrorResponse = {
      status_code: 403,
      message: "Permission denied",
      errors: [`Kindly upgrade your plan to access this resource`],
    };
    return response;
  }

  const cached = await cacheService.getCachedUrlStatistics(request);

  if (cached) {
    return cached;
  }

  try {
    const elasticStatsIndexName: string =
      process.env["ELASTIC_STATS_INDEX_NAME"]!;
    const urlStatsQuery = QueryBuilder.buildUrlStatsQuery(
      request,
      timestampFieldExistsInUrlStatistics
    );

    const searchResponse = await searchDocuments(
      elasticStatsIndexName,
      urlStatsQuery
    );

    timestampFieldExistsInUrlStatistics = true;

    if (!searchResponse) {
      throw new Error("Document search failed");
    }

    const totalHitsCount = (
      searchResponse.aggregations?.total_hits_count as any
    ).value;

    const averageRedirectDuration = parseFloat(
      (
        (searchResponse.aggregations?.avg_event_duration as any).value as number
      )?.toFixed(2)
    );

    const latestHits: EM.LatestHitsAggResp = (
      searchResponse.aggregations?.latest_hits as any
    ).hits;

    const __latestHits: RM.LatestHit[] = [];

    latestHits.hits.forEach((hit) => {
      const _latest_hit: RM.LatestHit = {
        ip: hit._source.ipAddress,
        device_info: hit._source.deviceInfo,
        redirect_duration: hit._source.eventDuration,
        timestamp: hit._source.timestamp,
        location: {
          country: hit._source.geoLocation.country,
          timezone: hit._source.geoLocation.timezone,
        },
      };

      __latestHits.push(_latest_hit);
    });

    const response: RM.UrlStatisticsResponse = {
      status_code: 200,
      total_hits: totalHitsCount,
      avg_redirect_duration: averageRedirectDuration
        ? `${averageRedirectDuration} ms`
        : `0 ms`,
      latest_hits: __latestHits,
    };

    await cacheService.setCachedUrlStatistics(request, response);

    return response;
  } catch (error: any) {
    if (isMissingTimestampFieldToSortError(error)) {
      timestampFieldExistsInUrlStatistics = false;
      logger.warn(
        "No 'timestamp' field found for sorting in url statistics. Sending fallback response",
        { requestId }
      );
      const response: RM.UrlStatisticsResponse = {
        status_code: 200,
        total_hits: 0,
        avg_redirect_duration: `0 ms`,
        latest_hits: [],
      };
      return response;
    }

    logger.error(`Error fetching URL statistics`, { error, requestId });

    const errorResponse: RM.ErrorResponse = {
      status_code: 500,
      errors: ["Internal Server Error"],
      message: "Internal Server Error",
    };

    return errorResponse;
  }
};

export const getDeviceMetricsStatistics = async (
  request: RequestModels.DeviceMetricsRequest
): Promise<RM.StatisticsResponse> => {
  const { requestId, userId } = request;

  logger.info(`Received device metrics request for userId ${userId}`, {
    requestId,
  });

  const isAllowed: boolean =
    await subscriptionService.isUserAllowedToAccessResource(
      request.requestId ?? null,
      request.userId,
      "device"
    );

  if (!isAllowed) {
    const response: RM.ErrorResponse = {
      status_code: 403,
      message: "Permission denied",
      errors: [`Kindly upgrade your plan to access this resource`],
    };
    return response;
  }

  const cached = await cacheService.getCachedDeviceMetrics(request);

  if (cached) {
    return cached;
  }

  try {
    const elasticStatsIndexName: string =
      process.env["ELASTIC_STATS_INDEX_NAME"]!;
    const deviceMetricsQuery = QueryBuilder.buildDeviceMetricsQuery(request);

    const searchResponse = await searchDocuments(
      elasticStatsIndexName,
      deviceMetricsQuery
    );

    if (!searchResponse) {
      throw new Error("Document search failed");
    }

    const deviceMetricsAggregation: EM.DeviceMetricResponseKey[] = (
      searchResponse.aggregations?.os_browsers as any
    ).buckets;

    const __browsers: RM.BrowserKey[] = [];
    const __osBrowsers: RM.OsBrowserKey[] = [];
    const __operatingSystems: RM.OSKey[] = [];
    const browsersMap = new Map();

    if (deviceMetricsAggregation.length > 0) {
      for (const deviceInfo of deviceMetricsAggregation) {
        const osBrowser: RM.OsBrowserKey = {
          os_name: deviceInfo.key,
          hits_count: deviceInfo.doc_count,
          browsers: deviceInfo.os_browsers.buckets.map((browser) => {
            const _browser: RM.BrowserKey = {
              name: browser.key,
              hits_count: browser.doc_count,
            };

            const browsersCount = browsersMap.get(_browser.name);
            browsersMap.set(
              _browser.name,
              browsersCount
                ? browsersCount + _browser.hits_count
                : _browser.hits_count
            );

            return _browser;
          }),
        };

        __osBrowsers.push(osBrowser);

        const os: RM.OSKey = {
          name: deviceInfo.key,
          hits_count: deviceInfo.doc_count,
        };
        __operatingSystems.push(os);
      }
    }

    for (const [browserName, hitsCount] of browsersMap.entries()) {
      const browser: RM.BrowserKey = {
        name: browserName,
        hits_count: hitsCount,
      };
      __browsers.push(browser);
    }

    const response: RM.DeviceMetricsResponse = {
      status_code: 200,
      os_browsers: __osBrowsers,
      browsers: __browsers,
      oss: __operatingSystems,
    };

    await cacheService.setCachedDeviceMetrics(request, response);

    return response;
  } catch (error: any) {
    logger.error(`Error fetching device metrics`, { requestId, error });

    const errorResponse: RM.ErrorResponse = {
      status_code: 500,
      errors: ["Internal Server Error"],
      message: "Internal Server Error",
    };

    return errorResponse;
  }
};

export const getGeographyMetricsStatistics = async (
  request: RequestModels.GeographicalMetricsRequest
): Promise<RM.StatisticsResponse> => {
  const { requestId, userId } = request;

  logger.info(`Received geography metrics request for userId ${userId}`, {
    requestId,
  });

  const isAllowed: boolean =
    await subscriptionService.isUserAllowedToAccessResource(
      request.requestId ?? null,
      request.userId,
      "geography"
    );

  if (!isAllowed) {
    const response: RM.ErrorResponse = {
      status_code: 403,
      message: "Permission denied",
      errors: [`Kindly upgrade your plan to access this resource`],
    };
    return response;
  }

  const cached = await cacheService.getCachedGeographyMetrics(request);

  if (cached) {
    return cached;
  }

  try {
    const elasticStatsIndexName: string =
      process.env["ELASTIC_STATS_INDEX_NAME"]!;
    const geographicaQuery = QueryBuilder.buildGeographicalQuery(request);

    const searchResponse = await searchDocuments(
      elasticStatsIndexName,
      geographicaQuery
    );

    if (!searchResponse) {
      throw new Error("Document search failed");
    }

    const geographyContinentsAggr: EM.GeoContinentAgg[] = (
      searchResponse.aggregations?.continents as any
    ).buckets;

    const __continents: RM.ContinentKey[] = [];
    const __countries: RM.CountryKey[] = [];

    if (geographyContinentsAggr.length > 0) {
      for (const continent of geographyContinentsAggr) {
        const countries = continent.countries!.buckets;
        const _countries: RM.CountryKey[] = [];

        for (const country of countries) {
          const cities = country.cities!.buckets;
          const _cities: RM.CityKey[] = [];

          for (const city of cities) {
            const _city: RM.CityKey = {
              name: city.key,
              hits_count: city.doc_count,
            };
            _cities.push(_city);
          }

          const _country: RM.CountryKey = {
            name: country.key,
            hits_count: country.doc_count,
            cities: _cities,
          };

          _countries.push(_country);
          __countries.push(_country);
        }

        const _continent: RM.ContinentKey = {
          name: continent.key,
          hits_count: continent.doc_count,
          countries: _countries,
        };
        __continents.push(_continent);
      }
    }

    __continents.sort((c1, c2) => c1.hits_count - c2.hits_count);
    __countries.sort((c1, c2) => c1.hits_count - c2.hits_count);

    const response: RM.GeographicalStatisticsResponse = {
      status_code: 200,
      continents: __continents,
      countries: __countries,
    };

    await cacheService.setCachedGeographicMetrics(request, response);

    return response;
  } catch (error: any) {
    logger.error(`Error fetching geography metrics`, { requestId, error });

    const errorResponse: RM.ErrorResponse = {
      status_code: 500,
      errors: ["Internal Server Error"],
      message: "Internal Server Error",
    };

    return errorResponse;
  }
};

export const getUsageStatistics = async (
  request: RequestModels.UsageRequest
): Promise<RM.StatisticsResponse> => {
  const { requestId, userId } = request;

  logger.info(`Received usage statistics request for userId ${userId}`, {
    requestId,
  });

  try {
    const elasticCreateIndexName: string =
      process.env["ELASTIC_CREATE_INDEX_NAME"]!;

    const usageQuery = QueryBuilder.buildUsageQuery(request);

    const searchResponse = await searchDocuments(
      elasticCreateIndexName,
      usageQuery
    );

    if (!searchResponse) {
      throw new Error("Document search failed");
    }

    const total: number | SearchTotalHits | undefined =
      searchResponse.hits.total;

    let value: number = 0;

    if (typeof total === "number") {
      value = total;
    } else if (total && "relation" in total && "value" in total) {
      value = total.value;
    } else {
      throw new Error("Failed to extract value");
    }

    const response: RM.UsageResponse = {
      status_code: 200,
      message: "Usage fetched successfully",
      key: request.metricName,
      value: value,
    };

    return response;
  } catch (error: any) {
    logger.error(`Error fetching usage metrics`, {
      requestId,
      error,
    });

    const errorResponse: RM.ErrorResponse = {
      status_code: 500,
      errors: ["Internal Server Error"],
      message: "Internal Server Error",
    };

    return errorResponse;
  }
};

const extractPrevSevenDaysHits = (response: any): RM.PerDayHitStats[] => {
  const status = response.status;

  if (status !== 200 || !response.aggregations) {
    return [];
  }

  const bucket: any[] = response.aggregations.prev_seven_days_hits?.buckets;

  const prevSevenDaysHits: RM.PerDayHitStats[] = [];

  bucket.forEach((b) => {
    const _b: RM.PerDayHitStats = {
      timestamp: b.key,
      hits: b.doc_count,
    };

    prevSevenDaysHits.push(_b);
  });

  return prevSevenDaysHits;
};

const isMissingTimestampFieldToSortError = (error: any): boolean => {
  return (
    error instanceof errors.ResponseError &&
    error.body?.status === 400 &&
    error.body?.error?.type === "search_phase_execution_exception" &&
    Array.isArray(error.body?.error?.root_cause) &&
    error.body.error.root_cause.some(
      (cause: any) =>
        cause.type === "query_shard_exception" &&
        cause.reason === "No mapping found for [timestamp] in order to sort on"
    )
  );
};
