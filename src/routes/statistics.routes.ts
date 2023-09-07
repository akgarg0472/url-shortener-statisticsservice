import express, { Request, Response } from "express";
import validateQueryParams from "../middleware/queryParamValidator.middleware";
import {
  addDeviceMetricsRequestAttribute,
  addGeographicalMetricsRequestAttribute,
  addPopularUrlRequestAttribute,
  addRedirectStatsRequestAttribute,
  addRedirectTimeRequestAttribute,
  addUrlMetricsRequestAttribute,
} from "../middleware/requestAttributeAdd.middleware";
import {
  DeviceMetricsRequest,
  GeographicalMetricsRequest,
  PopularUrlsRequest,
  RedirectStatisticsRequest,
  RedirectTimeRequest,
  UrlMetricsRequest,
} from "../model/request.models";
import { StatisticsResponse } from "../model/response.models";
import {
  getDeviceMetricsStatistics,
  getGeographyMetricsStatistics,
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
  async (req: Request, res: Response) => {
    const request: PopularUrlsRequest = (req as any).request;
    const response: StatisticsResponse = await getPopularUrlsStatistics(
      request
    );
    sendResponseToClient(response, res);
  }
);

statisticsRouter.get(
  "/device-metrics",
  validateQueryParams(["shortUrl", "userId", "startTime", "endTime"]),
  addDeviceMetricsRequestAttribute,
  async (req: Request, res: Response) => {
    const request: DeviceMetricsRequest = (req as any).request;
    const response: StatisticsResponse = await getDeviceMetricsStatistics(
      request
    );
    sendResponseToClient(response, res);
  }
);

statisticsRouter.get(
  "/geographical-metrics",
  validateQueryParams(["shortUrl", "startTime", "endTime"]),
  addGeographicalMetricsRequestAttribute,
  async (req: Request, res: Response) => {
    const request: GeographicalMetricsRequest = (req as any).request;
    const response: StatisticsResponse = await getGeographyMetricsStatistics(
      request
    );
    sendResponseToClient(response, res);
  }
);

statisticsRouter.get(
  "/redirect-stats",
  validateQueryParams(["shortUrl", "startTime", "endTime", "eventType"]),
  addRedirectStatsRequestAttribute,
  async (req: Request, res: Response) => {
    const request: RedirectStatisticsRequest = (req as any).request;
    const response: StatisticsResponse = await getRedirectStatsStatistics(
      request
    );
    sendResponseToClient(response, res);
  }
);

statisticsRouter.get(
  "/redirect-time",
  validateQueryParams(["shortUrl", "startTime", "endTime"]),
  addRedirectTimeRequestAttribute,
  async (req: Request, res: Response) => {
    const request: RedirectTimeRequest = (req as any).request;
    const response: StatisticsResponse = await getRedirectTimeStatistics(
      request
    );
    sendResponseToClient(response, res);
  }
);

statisticsRouter.get(
  "/url-metrics",
  validateQueryParams(["shortUrl", "startTime", "endTime"]),
  addUrlMetricsRequestAttribute,
  async (req: Request, res: Response) => {
    const request: UrlMetricsRequest = (req as any).request;
    const response: StatisticsResponse = await getUrlMetricsStatistics(request);
    sendResponseToClient(response, res);
  }
);

const sendResponseToClient = (response: StatisticsResponse, res: Response) => {
  if (response.http_code) {
    res.status(response.http_code);
    delete response.http_code;
  }

  res.json(response);
};

export default statisticsRouter;
