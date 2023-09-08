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
  limit: number;
}

interface GeneratedShortUrlsRequest {
  userId: string;
  limit: number;
  offset: number;
}

interface SummaryRequest extends _StatisticsRequest {}

export {
  DeviceMetricsRequest,
  GeneratedShortUrlsRequest,
  GeographicalMetricsRequest,
  IpMetricsRequest,
  PopularUrlsRequest,
  RedirectStatisticsRequest,
  RedirectTimeRequest,
  SummaryRequest,
  UrlMetricsRequest,
};
