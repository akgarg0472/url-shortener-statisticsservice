import {
  DeviceMetricResponseKey,
  PopularUrlResponseKey,
} from "../../model/elastic.models";
import {
  DeviceMetricsRequest,
  GeographicalMetricsRequest,
  IpMetricsRequest,
  PopularUrlsRequest,
  RedirectStatisticsRequest,
  RedirectTimeRequest,
  UrlMetricsRequest,
} from "../../model/request.models";
import {
  BrowserKey,
  DeviceMetricsResponse,
  ErrorResponse,
  GeographicalStatisticsResponse,
  IPStatisticsResponse,
  OsBrowserKey,
  PopularUrlKey,
  PopularUrlStatisticsResponse,
  RedirectStatisticsResponse,
  RedirectTimeStatisticsResponse,
  StatisticsResponse,
  UrlStatisticsResponse,
} from "../../model/response.models";
import { searchDocuments } from "../elastic/elastic.service";
import {
  buildDeviceMetricsQuery,
  buildPopularUrlQuery,
} from "./queryBuilder.service";

const getPopularUrlsStatistics = async (
  request: PopularUrlsRequest
): Promise<StatisticsResponse> => {
  try {
    const popularUrlQuery = buildPopularUrlQuery(
      request.userId,
      request.startTime,
      request.endTime,
      request.limit,
      request.sortOrder
    );

    const searchResponse = await searchDocuments(
      "urlshortener-fetch",
      popularUrlQuery
    );

    const topUrlsAggregation: PopularUrlResponseKey[] = (
      searchResponse.aggregations?.top_popular_urls as any
    ).buckets;

    const urls: PopularUrlKey[] = [];

    if (topUrlsAggregation && topUrlsAggregation.length > 0) {
      for (const popularUrl of topUrlsAggregation) {
        const url: PopularUrlKey = {
          shortUrl: popularUrl.key,
          successCount: popularUrl.success_count.doc_count,
        };
        urls.push(url);
      }
    }

    const popularUrlResponse: PopularUrlStatisticsResponse = {
      popularUrls: urls,
    };

    return Promise.resolve(popularUrlResponse);
  } catch (error: any) {
    const errorResponse: ErrorResponse = {
      httpCode: 500,
      errors: ["Internal Server Error"],
    };

    return errorResponse;
  }
};

const getDeviceMetricsStatistics = async (
  request: DeviceMetricsRequest
): Promise<StatisticsResponse> => {
  try {
    const deviceMetricsQuery = buildDeviceMetricsQuery(
      request.userId,
      request.shortUrl,
      request.startTime,
      request.endTime
    );

    const searchResponse = await searchDocuments(
      "urlshortener-fetch",
      deviceMetricsQuery
    );

    const deviceMetricsAggregation: DeviceMetricResponseKey[] = (
      searchResponse.aggregations?.os_browsers as any
    ).buckets;

    const osBrowsers: OsBrowserKey[] = [];

    if (deviceMetricsAggregation.length > 0) {
      for (const deviceInfo of deviceMetricsAggregation) {
        const osBrowser: OsBrowserKey = {
          osName: deviceInfo.key,
          count: deviceInfo.doc_count,
          browsers: deviceInfo.os_browsers.buckets.map((browser) => {
            const _browser: BrowserKey = {
              name: browser.key,
              count: browser.doc_count,
            };

            return _browser;
          }),
        };
        osBrowsers.push(osBrowser);
      }
    }

    const response: DeviceMetricsResponse = {
      httpCode: 200,
      osBrowsers,
    };

    return Promise.resolve(response);
  } catch (error) {
    const errorResponse: ErrorResponse = {
      httpCode: 500,
      errors: ["Internal Server Error"],
    };

    return errorResponse;
  }
};

const getGeographyMetricsStatistics = (
  request: GeographicalMetricsRequest
): StatisticsResponse => {
  console.log(request);

  const response: GeographicalStatisticsResponse = {
    httpCode: 200,
  };

  return response;
};

const getIpMetricsStatistics = (
  request: IpMetricsRequest
): StatisticsResponse => {
  console.log(request);

  const response: IPStatisticsResponse = {
    httpCode: 200,
  };

  return response;
};

const getRedirectStatsStatistics = (
  request: RedirectStatisticsRequest
): StatisticsResponse => {
  console.log(request);

  const response: RedirectStatisticsResponse = {
    httpCode: 200,
  };

  return response;
};

const getRedirectTimeStatistics = (
  request: RedirectTimeRequest
): StatisticsResponse => {
  console.log(request);

  const response: RedirectTimeStatisticsResponse = {
    httpCode: 200,
  };

  return response;
};

const getUrlMetricsStatistics = (
  request: UrlMetricsRequest
): StatisticsResponse => {
  console.log(request);

  const response: UrlStatisticsResponse = {
    httpCode: 200,
  };

  return response;
};

export {
  getDeviceMetricsStatistics,
  getGeographyMetricsStatistics,
  getIpMetricsStatistics,
  getPopularUrlsStatistics,
  getRedirectStatsStatistics,
  getRedirectTimeStatistics,
  getUrlMetricsStatistics,
};
