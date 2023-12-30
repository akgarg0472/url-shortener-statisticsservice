import * as RequestModels from "../../model/request.models";

const buildDashboardQuery = (
  request: RequestModels.DashboardRequest,
  createIndexName: string,
  statsIndexName: string
) => {
  return [
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
        continents: {
          terms: { field: "geoLocation.continent.keyword", size: 2147483647 },
        },
        countries: {
          terms: { field: "geoLocation.country.keyword", size: 2147483647 },
        },
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
      },
    },
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
    {
      index: statsIndexName,
    },
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

const buildUrlStatsQuery = (request: RequestModels.UrlMetricsRequest) => {
  return {
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
          sort: [{ timestamp: "desc" }],
        },
      },
    },
  };
};

const buildGeneratedShortUrlsQuery = (
  request: RequestModels.GeneratedShortUrlsRequest
) => {
  return {
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
    sort: [
      {
        timestamp: {
          order: "desc",
        },
      },
    ],
  };
};

export {
  buildDashboardQuery,
  buildDeviceMetricsQuery,
  buildGeneratedShortUrlsQuery,
  buildGeographicalQuery,
  buildPopularUrlQuery,
  buildUrlStatsQuery,
};
