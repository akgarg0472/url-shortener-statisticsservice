import { EventType } from "../../model/kafka.models";
import {
  DeviceMetricsRequest,
  GeographicalMetricsRequest,
  PopularUrlsRequest,
} from "../../model/request.models";

const buildPopularUrlQuery = (request: PopularUrlsRequest) => {
  const searchRequest = {
    size: 0,
    query: {
      bool: {
        must: [
          {
            term: {
              "userId.keyword": request.userId,
            },
          },
          {
            range: {
              timestamp: {
                gte: request.startTime,
                lte: request.endTime,
              },
            },
          },
        ],
      },
    },
    aggs: {
      top_popular_urls: {
        terms: {
          field: "shortUrl.keyword",
          size: request.limit <= 10 ? request.limit : 10,
          order: {
            _count: request.sortOrder,
          },
        },
        aggs: {
          success_count: {
            filter: {
              term: {
                "eventType.keyword": EventType.URL_GET_SUCCESS.toString(),
              },
            },
          },
        },
      },
    },
  };

  return searchRequest;
};

const buildDeviceMetricsQuery = (request: DeviceMetricsRequest) => {
  return {
    size: 0,
    query: {
      bool: {
        must: [
          {
            match: {
              userId: request.userId,
            },
          },
          {
            match: {
              shortUrl: request.shortUrl,
            },
          },
          {
            range: {
              timestamp: {
                gte: request.startTime,
                lte: request.endTime,
              },
            },
          },
        ],
      },
    },
    aggs: {
      os_browsers: {
        terms: {
          field: "deviceInfo.os.keyword",
          size: 2147483647,
        },
        aggs: {
          os_browsers: {
            terms: {
              field: "deviceInfo.browser.keyword",
              size: 2147483647,
            },
          },
        },
      },
    },
  };
};

const buildGeographicalQuery = (request: GeographicalMetricsRequest) => {
  return {
    size: 0,
    query: {
      bool: {
        must: [
          {
            match: {
              userId: request.userId,
            },
          },
          {
            match: {
              shortUrl: request.shortUrl,
            },
          },
          {
            range: {
              timestamp: {
                gte: request.startTime,
                lte: request.endTime,
              },
            },
          },
        ],
      },
    },
    aggs: {
      continents: {
        terms: {
          field: "geoLocation.continent.keyword",
        },
        aggs: {
          countries: {
            terms: {
              field: "geoLocation.country.keyword",
            },
            aggs: {
              cities: {
                terms: {
                  field: "geoLocation.city.keyword",
                },
              },
            },
          },
        },
      },
    },
  };
};

export {
  buildDeviceMetricsQuery,
  buildGeographicalQuery,
  buildPopularUrlQuery,
};
