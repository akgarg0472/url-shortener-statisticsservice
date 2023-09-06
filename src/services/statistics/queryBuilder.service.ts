import { EventType } from "../../model/kafka.models";

const buildPopularUrlQuery = (
  userId: string,
  startTime: number,
  endTime: number,
  limit: number,
  sortOrder: string
) => {
  const searchRequest = {
    size: 0,
    query: {
      bool: {
        must: [
          {
            term: {
              "userId.keyword": userId,
            },
          },
          {
            range: {
              timestamp: {
                gte: startTime,
                lte: endTime,
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
          size: limit,
          order: {
            _count: sortOrder,
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

const buildDeviceMetricsQuery = (
  userId: string,
  shortUrl: string,
  startTime: number,
  endTime: number
) => {
  return {
    size: 0,
    query: {
      bool: {
        must: [
          {
            match: {
              userId: userId,
            },
          },
          {
            match: {
              shortUrl: shortUrl,
            },
          },
          {
            range: {
              timestamp: {
                gte: startTime,
                lte: endTime,
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

export { buildDeviceMetricsQuery, buildPopularUrlQuery };
