import {
  DeviceMetricResponseKey,
  GeoContinentAgg,
  PopularUrlResponseKey,
} from "../../model/elastic.models";
import {
  DeviceMetricsRequest,
  GeographicalMetricsRequest,
  PopularUrlsRequest,
  RedirectStatisticsRequest,
  RedirectTimeRequest,
  UrlMetricsRequest,
} from "../../model/request.models";
import * as RM from "../../model/response.models";
import { searchDocuments } from "../elastic/elastic.service";
import {
  buildDeviceMetricsQuery,
  buildGeographicalQuery,
  buildPopularUrlQuery,
} from "./queryBuilder.service";

const getPopularUrlsStatistics = async (
  request: PopularUrlsRequest
): Promise<RM.StatisticsResponse> => {
  try {
    const popularUrlQuery = buildPopularUrlQuery(request);

    const searchResponse = await searchDocuments(
      "urlshortener-fetch",
      popularUrlQuery
    );

    const topUrlsAggregation: PopularUrlResponseKey[] = (
      searchResponse.aggregations?.top_popular_urls as any
    ).buckets;

    const urls: RM.PopularUrlKey[] = [];

    if (topUrlsAggregation && topUrlsAggregation.length > 0) {
      for (const popularUrl of topUrlsAggregation) {
        const url: RM.PopularUrlKey = {
          short_url: popularUrl.key,
          hits_count: popularUrl.success_count.doc_count,
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
      http_code: 500,
      errors: ["Internal Server Error"],
    };

    return errorResponse;
  }
};

const getDeviceMetricsStatistics = async (
  request: DeviceMetricsRequest
): Promise<RM.StatisticsResponse> => {
  try {
    const deviceMetricsQuery = buildDeviceMetricsQuery(request);

    const searchResponse = await searchDocuments(
      "urlshortener-fetch",
      deviceMetricsQuery
    );

    const deviceMetricsAggregation: DeviceMetricResponseKey[] = (
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
      http_code: 200,
      os_browsers: __osBrowsers,
      browsers: __browsers,
      oss: __operatingSystems,
    };

    return Promise.resolve(response);
  } catch (error) {
    const errorResponse: RM.ErrorResponse = {
      http_code: 500,
      errors: ["Internal Server Error"],
    };

    return errorResponse;
  }
};

const getGeographyMetricsStatistics = async (
  request: GeographicalMetricsRequest
): Promise<RM.StatisticsResponse> => {
  try {
    const geographicaQuery = buildGeographicalQuery(request);

    const searchResponse = await searchDocuments(
      "urlshortener-fetch",
      geographicaQuery
    );

    const geographyContinentsAggr: GeoContinentAgg[] = (
      searchResponse.aggregations?.continents as any
    ).buckets;

    const __continents: RM.ContinentKey[] = [];
    const __countries: RM.CountryKey[] = [];

    if (geographyContinentsAggr.length > 0) {
      for (const continent of geographyContinentsAggr) {
        const countries = continent.countries.buckets;
        const _countries: RM.CountryKey[] = [];

        for (const country of countries) {
          const cities = country.cities.buckets;
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

    const response: RM.GeographicalStatisticsResponse = {
      http_code: 200,
      continents: __continents,
      countries: __countries,
    };

    return response;
  } catch (error) {
    console.log(error);

    const errorResponse: RM.ErrorResponse = {
      http_code: 500,
      errors: ["Internal Server Error"],
    };

    return errorResponse;
  }
};

const getRedirectStatsStatistics = (
  request: RedirectStatisticsRequest
): RM.StatisticsResponse => {
  console.log(request);

  const response: RM.RedirectStatisticsResponse = {
    http_code: 200,
  };

  return response;
};

const getRedirectTimeStatistics = (
  request: RedirectTimeRequest
): RM.StatisticsResponse => {
  console.log(request);

  const response: RM.RedirectTimeStatisticsResponse = {
    http_code: 200,
  };

  return response;
};

const getUrlMetricsStatistics = (
  request: UrlMetricsRequest
): RM.StatisticsResponse => {
  console.log(request);

  const response: RM.UrlStatisticsResponse = {
    http_code: 200,
  };

  return response;
};

export {
  getDeviceMetricsStatistics,
  getGeographyMetricsStatistics,
  getPopularUrlsStatistics,
  getRedirectStatsStatistics,
  getRedirectTimeStatistics,
  getUrlMetricsStatistics,
};
