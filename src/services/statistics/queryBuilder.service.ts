import * as RequestModels from "../../model/request.models";

const buildDashboardQuery = (
  request: RequestModels.DashboardRequest,
  createIndexName: string,
  statsIndexName: string
) => {
  return [
    // Common metrics data [0]
    {},
    {
      size: 0,
      query: {
        bool: {
          must: [
            { term: { "userId.keyword": request.userId } },
            {
              range: {
                timestamp: { gte: request.startTime, lte: request.endTime },
              },
            },
          ],
        },
      },
      aggs: {
        total_hits: { value_count: { field: "requestId.keyword" } },
        avg_redirect_duration: { avg: { field: "eventDuration" } },
        current_day_hits: {
          filter: {
            range: {
              timestamp: {
                gte: request.currentDayStartTime,
                lte: request.currentTime,
              },
            },
          },
        },
        prev_day_hits: {
          filter: {
            range: {
              timestamp: {
                gte: request.currentDayStartTime - request.currentDayStartTime,
                lte: request.currentDayStartTime,
              },
            },
          },
        },
      },
    },

    // current day created links [1]
    { index: createIndexName },
    {
      size: 0,
      query: {
        bool: {
          must: [
            { term: { "userId.keyword": request.userId } },
            {
              range: {
                timestamp: {
                  gte: request.currentDayStartTime,
                  lte: request.currentTime,
                },
              },
            },
          ],
        },
      },
    },

    // prev day created links [2]
    { index: createIndexName },
    {
      size: 0,
      query: {
        bool: {
          must: [
            { term: { "userId.keyword": request.userId } },
            {
              range: {
                timestamp: {
                  gte: request.currentDayStartTime - 86400,
                  lte: request.currentDayStartTime,
                },
              },
            },
          ],
        },
      },
    },

    // prev seven days hits [3]
    { index: statsIndexName },
    {
      size: 0,
      query: {
        bool: {
          must: [
            { term: { "eventType.keyword": "URL_GET_SUCCESS" } },
            { term: { "userId.keyword": request.userId } },
            {
              range: {
                timestamp: {
                  gte: request.oneWeekOldTime,
                  lte: request.currentTime,
                },
              },
            },
          ],
        },
      },
      aggs: {
        prev_seven_days_hits: {
          date_histogram: {
            field: "timestamp",
            calendar_interval: "1d",
            min_doc_count: 0,
            time_zone: request.timezone ?? "UTC",
          },
        },
      },
    },
  ];
};

const buildPopularUrlQuery = (request: RequestModels.PopularUrlsRequest) => {
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
          size: request.limit,
          order: {
            _count: request.sortOrder,
          },
        },
        aggs: {
          most_hits: {
            value_count: {
              field: "shortUrl.keyword",
            },
          },
          original_url: {
            top_hits: {
              size: 1,
              _source: {
                includes: ["originalUrl"],
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
  request: RequestModels.DeviceMetricsRequest
) => {
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
          // {
          //   match: {
          //     shortUrl: request.shortUrl,
          //   },
          // },
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

const buildGeographicalQuery = (
  request: RequestModels.GeographicalMetricsRequest
) => {
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
          // {
          //   match: {
          //     shortUrl: request.shortUrl,
          //   },
          // },
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
          size: 2147483647,
        },
        aggs: {
          countries: {
            terms: {
              field: "geoLocation.country.keyword",
              size: 2147483647,
            },
            aggs: {
              cities: {
                terms: {
                  field: "geoLocation.city.keyword",
                  size: 2147483647,
                },
              },
            },
          },
        },
      },
    },
  };
};

const buildUrlStatsQuery = (
  request: RequestModels.UrlMetricsRequest,
  includeTimestampSort: boolean
) => {
  const query: any = {
    size: 0,
    query: {
      bool: {
        must: [
          {
            term: {
              "shortUrl.keyword": request.shortUrl,
            },
          },
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
      total_hits_count: {
        value_count: {
          field: "requestId.keyword",
        },
      },
      avg_event_duration: {
        avg: {
          field: "eventDuration",
        },
      },
      latest_hits: {
        top_hits: {
          size: request.limit,
        },
      },
    },
  };

  if (includeTimestampSort) {
    query.aggs.latest_hits.top_hits.sort = [{ timestamp: "desc" }];
  }

  return query;
};

const buildGeneratedShortUrlsQuery = (
  request: RequestModels.GeneratedShortUrlsRequest,
  includeTimestampSort: boolean
) => {
  const query: any = {
    size: request.limit,
    from: request.offset * request.limit,
    query: {
      bool: {
        must: [
          {
            term: {
              "userId.keyword": request.userId,
            },
          },
        ],
      },
    },
  };

  if (includeTimestampSort) {
    query.sort = [
      {
        timestamp: {
          order: "desc",
        },
      },
    ];
  }

  return query;
};

export {
  buildDashboardQuery,
  buildDeviceMetricsQuery,
  buildGeneratedShortUrlsQuery,
  buildGeographicalQuery,
  buildPopularUrlQuery,
  buildUrlStatsQuery,
};
