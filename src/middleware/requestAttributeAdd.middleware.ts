import { NextFunction, Request, Response } from "express";
import * as RequestModels from "../model/request.models";

const addPopularUrlRequestAttribute = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId, startTime, endTime, sortOrder, limit } = req.query;

  const popularUrlsRequest: RequestModels.PopularUrlsRequest = {
    userId: userId?.toString()!,
    startTime: parseInt(startTime?.toString()!),
    endTime: parseInt(endTime?.toString()!),
    sortOrder: sortOrder ? sortOrder.toString() : "asc",
    limit: limit ? parseInt(limit.toString()!) : 10,
  };

  (req as any).request = popularUrlsRequest;

  next();
};

const addDeviceMetricsRequestAttribute = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { shortUrl, userId, startTime, endTime } = req.query;

  const deviceMetricsRequest: RequestModels.DeviceMetricsRequest = {
    userId: userId?.toString()!,
    shortUrl: shortUrl?.toString()!,
    startTime: parseInt(startTime?.toString()!),
    endTime: parseInt(endTime?.toString()!),
  };

  (req as any).request = deviceMetricsRequest;

  next();
};

const addGeographicalMetricsRequestAttribute = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId, shortUrl, startTime, endTime } = req.query;

  const deviceMetricsRequest: RequestModels.GeographicalMetricsRequest = {
    userId: userId?.toString()!,
    shortUrl: shortUrl?.toString()!,
    startTime: parseInt(startTime?.toString()!),
    endTime: parseInt(endTime?.toString()!),
  };

  (req as any).request = deviceMetricsRequest;

  next();
};

const addIpRequestRequestAttribute = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId, shortUrl, startTime, endTime } = req.query;

  const deviceMetricsRequest: RequestModels.GeographicalMetricsRequest = {
    userId: userId?.toString()!,
    shortUrl: shortUrl?.toString()!,
    startTime: parseInt(startTime?.toString()!),
    endTime: parseInt(endTime?.toString()!),
  };

  (req as any).request = deviceMetricsRequest;

  next();
};

const addRedirectStatsRequestAttribute = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId, shortUrl, startTime, endTime, eventType } = req.query;

  const redirectStatisticsRequest: RequestModels.RedirectStatisticsRequest = {
    userId: userId?.toString()!,
    shortUrl: shortUrl?.toString()!,
    startTime: parseInt(startTime?.toString()!),
    endTime: parseInt(endTime?.toString()!),
    eventType: eventType?.toString()!,
  };

  (req as any).request = redirectStatisticsRequest;

  next();
};

const addRedirectTimeRequestAttribute = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId, shortUrl, startTime, endTime, eventType } = req.query;

  const redirectTimeRequest: RequestModels.RedirectTimeRequest = {
    userId: userId?.toString()!,
    shortUrl: shortUrl?.toString()!,
    startTime: parseInt(startTime?.toString()!),
    endTime: parseInt(endTime?.toString()!),
    eventType: eventType?.toString()!,
  };

  (req as any).request = redirectTimeRequest;

  next();
};

const addUrlMetricsRequestAttribute = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId, shortUrl, startTime, endTime, limit } = req.query;

  const __limit: number = parseInt(limit?.toString()!);

  const urlMetricsRequest: RequestModels.UrlMetricsRequest = {
    userId: userId?.toString()!,
    shortUrl: shortUrl?.toString()!,
    startTime: parseInt(startTime?.toString()!),
    endTime: parseInt(endTime?.toString()!),
    limit: __limit <= 10 ? __limit : 10,
  };

  (req as any).request = urlMetricsRequest;

  next();
};

const addSummaryRequestAttribute = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId, startTime, endTime } = req.query;

  const dashboardRequest: RequestModels.SummaryRequest = {
    userId: userId?.toString()!,
    startTime: parseInt(startTime?.toString()!),
    endTime: parseInt(endTime?.toString()!),
  };

  (req as any).request = dashboardRequest;

  next();
};

const addGeneratedShortUrlsRequestAttribute = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId, limit, offset } = req.query;

  const generatedShortUrlsRequest: RequestModels.GeneratedShortUrlsRequest = {
    userId: userId?.toString()!,
    limit: limit ? parseInt(limit.toString()!) : 5,
    offset: offset ? parseInt(offset.toString()!) : 0,
  };

  (req as any).request = generatedShortUrlsRequest;

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
};
