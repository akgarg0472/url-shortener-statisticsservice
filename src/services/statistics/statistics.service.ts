import * as EM from "../../model/elastic.models";
import * as RequestModels from "../../model/request.models";
import * as RM from "../../model/response.models";
import { multiSearch, searchDocuments } from "../elastic/elastic.service";
import * as QueryBuilder from "./queryBuilder.service";

const getSummaryStatistics = async (
  request: RequestModels.DashboardRequest
): Promise<RM.StatisticsResponse> => {
  try {
    const statsIndexName = process.env.ELASTIC_STATS_INDEX_NAME;
    const createIndexName = process.env.ELASTIC_CREATE_INDEX_NAME;

    const dashboardQuery = QueryBuilder.buildDashboardQuery(
      request,
      createIndexName!,
      statsIndexName!
    );

    const searchResponse: any = await multiSearch(
      statsIndexName!,
      dashboardQuery
    );

    const totalHits: number = (
      searchResponse.responses[0].aggregations?.total_hits as any
    ).value;

    const currentDayHitsCount = (
      searchResponse.responses[0].aggregations?.current_day_hits as any
    ).doc_count;

    const averageRedirectDuration: number = parseFloat(
      (
        (searchResponse.responses[0].aggregations?.avg_redirect_duration as any)
          .value as number
      )?.toFixed(2)
    );

    const continentAgg: EM.GeoContinentAgg[] = (
      searchResponse.responses[0].aggregations?.continents as any
    ).buckets;

    const countriesAgg: EM.GeoCountry[] = (
      searchResponse.responses[0].aggregations?.countries as any
    ).buckets;

    const __continents: RM.ContinentKey[] = continentAgg.map((continent) => {
      const _continent: RM.ContinentKey = {
        name: continent.key,
        hits_count: continent.doc_count,
      };
      return _continent;
    });

    const __countries: RM.CountryKey[] = countriesAgg.map((country) => {
      const _country: RM.CountryKey = {
        name: country.key,
        hits_count: country.doc_count,
      };

      return _country;
    });

    const currentDayUrlsCreated: number =
      searchResponse.responses[1].hits.total.value;

    const prevSevenDaysHits: RM.PerDayHitStats[] = extractPrevSevenDaysHits(
      searchResponse.responses[2]
    );

    const lifetimeStats: RM.DashboardApiStat[] = [
      {
        key: "Total Hits",
        value: totalHits,
        icon: "/assets/icons/total-hits.png",
      },
      {
        key: "Avg Redirect Duration",
        value: averageRedirectDuration
          ? `${averageRedirectDuration.toFixed(2)} ms`
          : `0 ms`,
        icon: "/assets/icons/clock.png",
      },
    ];

    const currentDayStats: RM.DashboardApiStat[] = [
      {
        key: "Total Hits",
        value: currentDayHitsCount,
        icon: "/assets/icons/total-hits.png",
      },
      {
        key: "New Links",
        value: currentDayUrlsCreated,
        icon: "/assets/icons/add-link.png",
      },
    ];

    const response: RM.DashboardResponse = {
      status_code: 200,
      lifetime_stats: lifetimeStats,
      current_day_stats: currentDayStats,
      continents: __continents.slice(0, 5),
      countries: __countries.slice(0, 5),
      prev_seven_days_hits: prevSevenDaysHits,
    };

    return response;
  } catch (err) {
    console.log(`Error in GET summary: ${err}`);
    const errorResponse: RM.ErrorResponse = {
      status_code: 500,
      errors: ["Internal Server Error"],
      message: "Internal Server Error",
    };

    return errorResponse;
  }
};

const getGeneratedShortUrls = async (
  request: RequestModels.GeneratedShortUrlsRequest
): Promise<RM.StatisticsResponse> => {
  try {
    const query = QueryBuilder.buildGeneratedShortUrlsQuery(request);
    const elasticCreateIndexName = process.env.ELASTIC_CREATE_INDEX_NAME;

    const searchResponse = await searchDocuments(
      elasticCreateIndexName!,
      query
    );

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

    return response;
  } catch (error) {
    const errorResponse: RM.ErrorResponse = {
      status_code: 500,
      errors: ["Internal Server Error"],
      message: "Internal Server Error",
    };

    return errorResponse;
  }
};

const getPopularUrlsStatistics = async (
  request: RequestModels.PopularUrlsRequest
): Promise<RM.StatisticsResponse> => {
  try {
    const popularUrlQuery = QueryBuilder.buildPopularUrlQuery(request);
    const elasticStatsIndexName = process.env.ELASTIC_STATS_INDEX_NAME;

    const searchResponse = await searchDocuments(
      elasticStatsIndexName!,
      popularUrlQuery
    );

    const topUrlsAggregation: EM.PopularUrlResponseKey[] = (
      searchResponse.aggregations?.top_popular_urls as any
    ).buckets;

    const urls: RM.PopularUrlKey[] = [];

    if (topUrlsAggregation && topUrlsAggregation.length > 0) {
      for (const popularUrl of topUrlsAggregation) {
        const url: RM.PopularUrlKey = {
          short_url: popularUrl.key,
          hits_count: popularUrl.doc_count,
        };
        urls.push(url);
      }
    }

    const popularUrlResponse: RM.PopularUrlStatisticsResponse = {
      popular_urls: urls,
    };

    return Promise.resolve(popularUrlResponse);
  } catch (error: any) {
    const errorResponse: RM.ErrorResponse = {
      status_code: 500,
      errors: ["Internal Server Error"],
      message: "Internal Server Error",
    };

    return errorResponse;
  }
};

const getUrlStatistics = async (
  request: RequestModels.UrlMetricsRequest
): Promise<RM.StatisticsResponse> => {
  try {
    const urlStatsQuery = QueryBuilder.buildUrlStatsQuery(request);
    const elasticStatsIndexName = process.env.ELASTIC_STATS_INDEX_NAME;

    const searchResponse = await searchDocuments(
      elasticStatsIndexName!,
      urlStatsQuery
    );

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

    return response;
  } catch (error: any) {
    console.log(error);

    const errorResponse: RM.ErrorResponse = {
      status_code: 500,
      errors: ["Internal Server Error"],
      message: "Internal Server Error",
    };

    return errorResponse;
  }
};

const getDeviceMetricsStatistics = async (
  request: RequestModels.DeviceMetricsRequest
): Promise<RM.StatisticsResponse> => {
  try {
    const deviceMetricsQuery = QueryBuilder.buildDeviceMetricsQuery(request);
    const elasticStatsIndexName = process.env.ELASTIC_STATS_INDEX_NAME;

    const searchResponse = await searchDocuments(
      elasticStatsIndexName!,
      deviceMetricsQuery
    );

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

    return Promise.resolve(response);
  } catch (error) {
    const errorResponse: RM.ErrorResponse = {
      status_code: 500,
      errors: ["Internal Server Error"],
      message: "Internal Server Error",
    };

    return errorResponse;
  }
};

const getGeographyMetricsStatistics = async (
  request: RequestModels.GeographicalMetricsRequest
): Promise<RM.StatisticsResponse> => {
  try {
    const geographicaQuery = QueryBuilder.buildGeographicalQuery(request);
    const elasticStatsIndexName = process.env.ELASTIC_STATS_INDEX_NAME;

    const searchResponse = await searchDocuments(
      elasticStatsIndexName!,
      geographicaQuery
    );

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

    return response;
  } catch (error) {
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

export {
  getDeviceMetricsStatistics,
  getGeneratedShortUrls,
  getGeographyMetricsStatistics,
  getPopularUrlsStatistics,
  getSummaryStatistics,
  getUrlStatistics,
};
