enum EventType {
  URL_CREATE_SUCCESS = "URL_CREATE_SUCCESS",
  URL_CREATE_FAILED = "URL_CREATE_FAILED",
  URL_GET_SUCCESS = "URL_GET_SUCCESS",
  URL_GET_FAILED = "URL_GET_FAILED",
}

type StatisticsEvent = {
  requestId: any;
  eventType: EventType;
  shortUrl: string;
  originalUrl: string;
  userId: string;
  ipAddress: string;
  userAgent: string;
  createdAt: number;
  eventDuration: number;
  timestamp: number;
  customAlias: boolean;
};

export { EventType, StatisticsEvent };
