enum EventType {
  URL_CREATE_FAILED = "URL_CREATE_FAILED",
  URL_CREATE_SUCCESS = "URL_CREATE_SUCCESS",
  URL_GET_FAILED = "URL_GET_FAILED",
  URL_GET_SUCCESS = "URL_GET_SUCCESS",
}

type UrlCreateStatisticsEvent = {
  requestId: any;
  eventType: string;
  shortUrl: string;
  originalUrl: string;
  userId: string | null;
  createdAt: number;
  ipAddress: string;
  eventDuration: number;
  timestamp: number;
  deviceInfo: DeviceInfo;
  geoLocation: GeoLocationInfo;
};

type UrlFetchStatisticsEvent = {
  requestId: any;
  eventType: string;
  shortUrl: string;
  userId: string | null;
  originalUrl: string;
  ipAddress: string;
  deviceInfo: DeviceInfo;
  eventDuration: number;
  timestamp: number;
  geoLocation: GeoLocationInfo;
};

type DeviceInfo = {
  os: string;
  browser: string;
};

type UrlMetadata = {
  shortUrl: string;
  originalUrl: string;
};

type GeoLocationInfo = {
  continent: string;
  country: string;
  city: string;
  lat: number;
  lon: number;
  timezone: string;
};

export {
  DeviceInfo,
  EventType,
  GeoLocationInfo,
  UrlCreateStatisticsEvent,
  UrlFetchStatisticsEvent,
  UrlMetadata,
};
