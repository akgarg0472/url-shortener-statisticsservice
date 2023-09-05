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

export { buildPopularUrlQuery };
