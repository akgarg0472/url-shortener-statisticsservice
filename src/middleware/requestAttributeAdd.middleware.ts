import { NextFunction, Request, Response } from "express";
import * as RequestModels from "../model/request.models";
import { REQUEST_ID_HEADER } from "../utils/constants";

const addPopularUrlRequestAttribute = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId, startTime, endTime, sortOrder, limit } = req.query;

  const request: RequestModels.PopularUrlsRequest = {
    userId: userId?.toString()!,
    startTime: parseInt(startTime?.toString()!),
    endTime: parseInt(endTime?.toString()!),
    sortOrder: sortOrder ? sortOrder.toString() : "asc",
    limit: limit ? parseInt(limit.toString()!) : 10,
    requestId: req.get(REQUEST_ID_HEADER),
  };

  (req as any).request = request;
  (req as any).requestId = request.requestId;

  next();
};

const addDeviceMetricsRequestAttribute = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { shortUrl, userId, startTime, endTime } = req.query;

  const request: RequestModels.DeviceMetricsRequest = {
    userId: userId?.toString()!,
    shortUrl: shortUrl?.toString()!,
    startTime: parseInt(startTime?.toString()!),
    endTime: parseInt(endTime?.toString()!),
    requestId: req.get(REQUEST_ID_HEADER),
  };

  (req as any).request = request;
  (req as any).requestId = request.requestId;

  next();
};

const addGeographicalMetricsRequestAttribute = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId, shortUrl, startTime, endTime } = req.query;

  const request: RequestModels.GeographicalMetricsRequest = {
    userId: userId?.toString()!,
    shortUrl: shortUrl?.toString()!,
    startTime: parseInt(startTime?.toString()!),
    endTime: parseInt(endTime?.toString()!),
    requestId: req.get(REQUEST_ID_HEADER),
  };

  (req as any).request = request;
  (req as any).requestId = request.requestId;

  next();
};

const addIpRequestRequestAttribute = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId, shortUrl, startTime, endTime } = req.query;

  const request: RequestModels.GeographicalMetricsRequest = {
    userId: userId?.toString()!,
    shortUrl: shortUrl?.toString()!,
    startTime: parseInt(startTime?.toString()!),
    endTime: parseInt(endTime?.toString()!),
    requestId: req.get(REQUEST_ID_HEADER),
  };

  (req as any).request = request;
  (req as any).requestId = request.requestId;

  next();
};

const addRedirectStatsRequestAttribute = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId, shortUrl, startTime, endTime, eventType } = req.query;

  const request: RequestModels.RedirectStatisticsRequest = {
    userId: userId?.toString()!,
    shortUrl: shortUrl?.toString()!,
    startTime: parseInt(startTime?.toString()!),
    endTime: parseInt(endTime?.toString()!),
    eventType: eventType?.toString()!,
    requestId: req.get(REQUEST_ID_HEADER),
  };

  (req as any).request = request;
  (req as any).requestId = request.requestId;

  next();
};

const addRedirectTimeRequestAttribute = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId, shortUrl, startTime, endTime, eventType } = req.query;

  const request: RequestModels.RedirectTimeRequest = {
    userId: userId?.toString()!,
    shortUrl: shortUrl?.toString()!,
    startTime: parseInt(startTime?.toString()!),
    endTime: parseInt(endTime?.toString()!),
    eventType: eventType?.toString()!,
    requestId: req.get(REQUEST_ID_HEADER),
  };

  (req as any).request = request;
  (req as any).requestId = request.requestId;

  next();
};

const addUrlMetricsRequestAttribute = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId, shortUrl, startTime, endTime, limit } = req.query;

  const __limit: number = parseInt(limit?.toString()!);

  const request: RequestModels.UrlMetricsRequest = {
    userId: userId?.toString()!,
    shortUrl: shortUrl?.toString()!,
    startTime: parseInt(startTime?.toString()!),
    endTime: parseInt(endTime?.toString()!),
    limit: __limit <= 10 ? __limit : 10,
    requestId: req.get(REQUEST_ID_HEADER),
  };

  (req as any).request = request;
  (req as any).requestId = request.requestId;

  next();
};

const addSummaryRequestAttribute = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const {
    userId,
    startTime,
    endTime,
    currentDayStartTime,
    currentTime,
    oneWeekOldTime,
    timezone,
  } = req.query;

  const request: RequestModels.DashboardRequest = {
    userId: userId?.toString()!,
    startTime: parseInt(startTime?.toString()!),
    endTime: parseInt(endTime?.toString()!),
    currentDayStartTime: parseInt(currentDayStartTime?.toString()!),
    currentTime: parseInt(currentTime?.toString()!),
    oneWeekOldTime: parseInt(oneWeekOldTime?.toString()!),
    timezone: timezone?.toString(),
    requestId: req.get(REQUEST_ID_HEADER),
  };

  (req as any).request = request;
  (req as any).requestId = request.requestId;

  next();
};

const addGeneratedShortUrlsRequestAttribute = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId, limit, offset } = req.query;

  const request: RequestModels.GeneratedShortUrlsRequest = {
    userId: userId?.toString()!,
    limit: limit ? parseInt(limit.toString()!) : 5,
    offset: offset ? parseInt(offset.toString()!) : 0,
    requestId: req.get(REQUEST_ID_HEADER),
  };

  (req as any).request = request;
  (req as any).requestId = request.requestId;

  next();
};

const addUsageRequestAttributes = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { metricName, userId, startTime, endTime } = req.query;
  const request: RequestModels.UsageRequest = {
    metricName: metricName!.toString(),
    userId: userId!.toString(),
    startTime: parseInt(startTime!.toString(), 10),
    endTime: parseInt(endTime!.toString(), 10),
    requestId: req.get(REQUEST_ID_HEADER),
  };

  (req as any).request = request;
  (req as any).requestId = request.requestId;

  next();
};

export {
  addDeviceMetricsRequestAttribute,
  addGeneratedShortUrlsRequestAttribute,
  addGeographicalMetricsRequestAttribute,
  addIpRequestRequestAttribute,
  addPopularUrlRequestAttribute,
  addRedirectStatsRequestAttribute,
  addRedirectTimeRequestAttribute,
  addSummaryRequestAttribute,
  addUrlMetricsRequestAttribute,
  addUsageRequestAttributes,
};
