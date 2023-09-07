interface _StatisticsRequest {
  startTime: number;
  endTime: number;
  userId: string;
}

interface PopularUrlsRequest extends _StatisticsRequest {
  sortOrder: string;
  limit: number;
}

interface DeviceMetricsRequest extends _StatisticsRequest {
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
