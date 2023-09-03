import { NextFunction, Request, Response } from "express";
import {
  DeviceMetricsRequest,
  GeographicalMetricsRequest,
  PopularUrlsRequest,
  RedirectStatisticsRequest,
  RedirectTimeRequest,
  UrlMetricsRequest,
} from "../model/request.models";

const addPopularUrlRequestAttribute = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId, startTime, endTime, sortOrder, limit } = req.query;

  const popularUrlsRequest: PopularUrlsRequest = {
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
  const { shortUrl, startTime, endTime } = req.query;

  const deviceMetricsRequest: DeviceMetricsRequest = {
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
  const { shortUrl, startTime, endTime } = req.query;

  const deviceMetricsRequest: GeographicalMetricsRequest = {
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
  const { shortUrl, startTime, endTime } = req.query;

  const deviceMetricsRequest: GeographicalMetricsRequest = {
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
  const { shortUrl, startTime, endTime, eventType } = req.query;

  const redirectStatisticsRequest: RedirectStatisticsRequest = {
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
  const { shortUrl, startTime, endTime, eventType } = req.query;

  const redirectTimeRequest: RedirectTimeRequest = {
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
  const { shortUrl, startTime, endTime } = req.query;

  const urlMetricsRequest: UrlMetricsRequest = {
    shortUrl: shortUrl?.toString()!,
    startTime: parseInt(startTime?.toString()!),
    endTime: parseInt(endTime?.toString()!),
  };

  (req as any).request = urlMetricsRequest;

  next();
};

export {
  addDeviceMetricsRequestAttribute,
  addGeographicalMetricsRequestAttribute,
  addIpRequestRequestAttribute,
  addPopularUrlRequestAttribute,
  addRedirectStatsRequestAttribute,
  addRedirectTimeRequestAttribute,
  addUrlMetricsRequestAttribute,
};
