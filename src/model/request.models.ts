interface _StatisticsRequest {
  startTime: number;
  endTime: number;
  userId: string;
  requestId?: string;
}

interface PopularUrlsRequest extends _StatisticsRequest {
  sortOrder: string;
  limit: number;
}

interface DeviceMetricsRequest extends _StatisticsRequest {
  shortUrl?: string;
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

type GeneratedShortUrlsRequest = {
  userId: string;
  limit: number;
  offset: number;
  requestId?: string;
};

interface DashboardRequest extends _StatisticsRequest {
  currentDayStartTime: number;
  currentTime: number;
  oneWeekOldTime: number;
  timezone?: string;
}

type UsageRequest = {
  metricName: string;
  userId: string;
  startTime: number;
  endTime: number;
  requestId?: string;
};

export {
  DashboardRequest,
  DeviceMetricsRequest,
  GeneratedShortUrlsRequest,
  GeographicalMetricsRequest,
  IpMetricsRequest,
  PopularUrlsRequest,
  RedirectStatisticsRequest,
  RedirectTimeRequest,
  UrlMetricsRequest,
  UsageRequest,
};
