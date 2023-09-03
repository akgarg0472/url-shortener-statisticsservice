import express, { Request, Response } from "express";
import validateQueryParams from "../middleware/queryParamValidator.middleware";
import {
  addDeviceMetricsRequestAttribute,
  addGeographicalMetricsRequestAttribute,
  addIpRequestRequestAttribute,
  addPopularUrlRequestAttribute,
  addRedirectStatsRequestAttribute,
  addRedirectTimeRequestAttribute,
  addUrlMetricsRequestAttribute,
} from "../middleware/requestAttributeAdd.middleware";
import {
  DeviceMetricsRequest,
  GeographicalMetricsRequest,
  IpMetricsRequest,
  PopularUrlsRequest,
  RedirectStatisticsRequest,
  RedirectTimeRequest,
  UrlMetricsRequest,
} from "../model/request.models";
import { StatisticsResponse } from "../model/response.models";
import {
  getDeviceMetricsStatistics,
  getGeographyMetricsStatistics,
  getIpMetricsStatistics,
  getPopularUrlsStatistics,
  getRedirectStatsStatistics,
  getRedirectTimeStatistics,
  getUrlMetricsStatistics,
} from "../services/statistics/statistics.service";

const statisticsRouter = express.Router();

statisticsRouter.get(
  "/popular-urls",
  validateQueryParams(["userId", "startTime", "endTime"]),
  addPopularUrlRequestAttribute,
  (req: Request, res: Response) => {
    const request: PopularUrlsRequest = (req as any).request;
    const response: StatisticsResponse = getPopularUrlsStatistics(request);
    res.status(response.httpCode).json(response);
  }
);

statisticsRouter.get(
  "/device-metrics",
  validateQueryParams(["shortUrl", "startTime", "endTime"]),
  addDeviceMetricsRequestAttribute,
  (req: Request, res: Response) => {
    const request: DeviceMetricsRequest = (req as any).request;
    const response: StatisticsResponse = getDeviceMetricsStatistics(request);
    res.status(response.httpCode).send(response);
  }
);

statisticsRouter.get(
  "/geographical-metrics",
  validateQueryParams(["shortUrl", "startTime", "endTime"]),
  addGeographicalMetricsRequestAttribute,
  (req: Request, res: Response) => {
    const request: GeographicalMetricsRequest = (req as any).request;
    const response: StatisticsResponse = getGeographyMetricsStatistics(request);
    res.status(response.httpCode).send(response);
  }
);

statisticsRouter.get(
  "/ip-metrics",
  validateQueryParams(["shortUrl", "startTime", "endTime"]),
  addIpRequestRequestAttribute,
  (req: Request, res: Response) => {
    const request: IpMetricsRequest = (req as any).request;
    const response: StatisticsResponse = getIpMetricsStatistics(request);
    res.status(response.httpCode).send(response);
  }
);

statisticsRouter.get(
  "/redirect-stats",
  validateQueryParams(["shortUrl", "startTime", "endTime", "eventType"]),
  addRedirectStatsRequestAttribute,
  (req: Request, res: Response) => {
    const request: RedirectStatisticsRequest = (req as any).request;
    const response: StatisticsResponse = getRedirectStatsStatistics(request);
    res.status(response.httpCode).send(response);
  }
);

statisticsRouter.get(
  "/redirect-time",
  validateQueryParams(["shortUrl", "startTime", "endTime"]),
  addRedirectTimeRequestAttribute,
  (req: Request, res: Response) => {
    const request: RedirectTimeRequest = (req as any).request;
    const response: StatisticsResponse = getRedirectTimeStatistics(request);
    res.status(response.httpCode).send(response);
  }
);

statisticsRouter.get(
  "/url-metrics",
  validateQueryParams(["shortUrl", "startTime", "endTime"]),
  addUrlMetricsRequestAttribute,
  (req: Request, res: Response) => {
    const request: UrlMetricsRequest = (req as any).request;
    const response: StatisticsResponse = getUrlMetricsStatistics(request);
    res.status(response.httpCode).send(response);
  }
);

export default statisticsRouter;
