interface PopularUrlsRequest {
  userId: string;
  startTime: number;
  endTime: number;
  sortOrder: string;
  limit: number;
}

interface DeviceMetricsRequest {
  shortUrl: string;
  startTime: number;
  endTime: number;
}

interface GeographicalMetricsRequest {
  shortUrl: string;
  startTime: number;
  endTime: number;
}

interface IpMetricsRequest {
  shortUrl: string;
  startTime: number;
  endTime: number;
}

interface RedirectStatisticsRequest {
  shortUrl: string;
  startTime: number;
  endTime: number;
  eventType: string;
}

interface RedirectTimeRequest {
  shortUrl: string;
  startTime: number;
  endTime: number;
  eventType: string;
}

interface UrlMetricsRequest {
  shortUrl: string;
  startTime: number;
  endTime: number;
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
