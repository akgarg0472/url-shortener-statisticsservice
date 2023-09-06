interface _StatisticsRequest {
  startTime: number;
  endTime: number;
}

interface PopularUrlsRequest extends _StatisticsRequest {
  userId: string;
  sortOrder: string;
  limit: number;
}

interface DeviceMetricsRequest extends _StatisticsRequest {
  userId: string;
  shortUrl: string;
}

interface GeographicalMetricsRequest extends _StatisticsRequest {
  shortUrl: string;
}

interface IpMetricsRequest extends _StatisticsRequest {
  shortUrl: string;
}

interface RedirectStatisticsRequest extends _StatisticsRequest {
  shortUrl: string;
  eventType: string;
}

interface RedirectTimeRequest extends _StatisticsRequest {
  shortUrl: string;
  eventType: string;
}

interface UrlMetricsRequest extends _StatisticsRequest {
  shortUrl: string;
}

export {
  DeviceMetricsRequest,
  GeographicalMetricsRequest,
  IpMetricsRequest,
  PopularUrlsRequest,
  RedirectStatisticsRequest,
  RedirectTimeRequest,
  UrlMetricsRequest,
};
