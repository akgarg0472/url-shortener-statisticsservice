import * as EM from "../../model/elastic.models";
import * as RequestModels from "../../model/request.models";
import * as RM from "../../model/response.models";
import { searchDocuments } from "../elastic/elastic.service";
import * as QueryBuilder from "./queryBuilder.service";

const elasticIndexName = process.env.ELASTIC_STATS_INDEX_NAME;

const getSummaryStatistics = async (
  request: RequestModels.SummaryRequest
): Promise<RM.StatisticsResponse> => {
  try {
    const dashboardQuery = QueryBuilder.buildSummaryQuery(request);

    const searchResponse = await searchDocuments(
      elasticIndexName!,
      dashboardQuery
    );

    const totalHits: number = (searchResponse.aggregations?.total_hits as any)
      .value;

    const averageRedirectDuration: number = parseFloat(
      (
        (searchResponse.aggregations?.avg_redirect_duration as any)
          .value as number
      ).toFixed(2)
    );

    const continentAgg: EM.GeoContinentAgg[] = (
      searchResponse.aggregations?.continents as any
    ).buckets;

    const countriesAgg: EM.GeoCountry[] = (
      searchResponse.aggregations?.countries as any
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

    const response: RM.DashboardResponse = {
      http_code: 200,
      total_hits: totalHits,
      avg_redirect_duration: averageRedirectDuration,
      continents: __continents.slice(0, 5),
      countries: __countries.slice(0, 5),
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

const getPopularUrlsStatistics = async (
  request: RequestModels.PopularUrlsRequest
): Promise<RM.StatisticsResponse> => {
  try {
    const popularUrlQuery = QueryBuilder.buildPopularUrlQuery(request);

    const searchResponse = await searchDocuments(
      elasticIndexName!,
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
    console.log(error);

    const errorResponse: RM.ErrorResponse = {
      http_code: 500,
      errors: ["Internal Server Error"],
    };

    return errorResponse;
  }
};

const getUrlStatistics = async (
  request: RequestModels.UrlMetricsRequest
): Promise<RM.StatisticsResponse> => {
  const urlStatsQuery = QueryBuilder.buildUrlStatsQuery(request);

  const searchResponse = await searchDocuments(
    elasticIndexName!,
    urlStatsQuery
  );

  const totalHitsCount = (searchResponse.aggregations?.total_hits_count as any)
    .value;

  const averageEventsDuration = parseFloat(
    (
      (searchResponse.aggregations?.avg_event_duration as any).value as number
    ).toFixed(2)
  );

  console.log(searchResponse);

  return {
    http_code: 200,
  };
};

const getDeviceMetricsStatistics = async (
  request: RequestModels.DeviceMetricsRequest
): Promise<RM.StatisticsResponse> => {
  try {
    const deviceMetricsQuery = QueryBuilder.buildDeviceMetricsQuery(request);

    const searchResponse = await searchDocuments(
      elasticIndexName!,
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
  request: RequestModels.GeographicalMetricsRequest
): Promise<RM.StatisticsResponse> => {
  try {
    const geographicaQuery = QueryBuilder.buildGeographicalQuery(request);

    const searchResponse = await searchDocuments(
      elasticIndexName!,
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

export {
  getDeviceMetricsStatistics,
  getGeographyMetricsStatistics,
  getPopularUrlsStatistics,
  getSummaryStatistics,
  getUrlStatistics,
};
