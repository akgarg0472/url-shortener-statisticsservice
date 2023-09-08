import express, { Request, Response } from "express";
import validateQueryParams from "../middleware/queryParamValidator.middleware";
import * as middlewares from "../middleware/requestAttributeAdd.middleware";
import * as RequestModels from "../model/request.models";
import { StatisticsResponse } from "../model/response.models";
import * as statisticsService from "../services/statistics/statistics.service";

const statisticsRouter = express.Router();

statisticsRouter.get(
  "/summary",
  validateQueryParams(["userId", "startTime", "endTime"]),
  middlewares.addSummaryRequestAttribute,
  async (req: Request, res: Response) => {
    const request: RequestModels.SummaryRequest = (req as any).request;
    const response: StatisticsResponse =
      await statisticsService.getSummaryStatistics(request);
    sendResponseToClient(response, res);
  }
);

statisticsRouter.get(
  "/generated-urls",
  validateQueryParams(["userId", "limit", "offset"]),
  middlewares.addGeneratedShortUrlsRequestAttribute,
  async (req: Request, res: Response) => {
    const request: RequestModels.GeneratedShortUrlsRequest = (req as any)
      .request;
    const response: StatisticsResponse =
      await statisticsService.getGeneratedShortUrls(request);
    sendResponseToClient(response, res);
  }
);

statisticsRouter.get(
  "/popular-urls",
  validateQueryParams(["userId", "startTime", "endTime"]),
  middlewares.addPopularUrlRequestAttribute,
  async (req: Request, res: Response) => {
    const request: RequestModels.PopularUrlsRequest = (req as any).request;
    const response: StatisticsResponse =
      await statisticsService.getPopularUrlsStatistics(request);
    sendResponseToClient(response, res);
  }
);

statisticsRouter.get(
  "/url-metrics",
  validateQueryParams(["userId", "shortUrl", "startTime", "limit", "endTime"]),
  middlewares.addUrlMetricsRequestAttribute,
  async (req: Request, res: Response) => {
    const request: RequestModels.UrlMetricsRequest = (req as any).request;
    const response: StatisticsResponse =
      await statisticsService.getUrlStatistics(request);
    sendResponseToClient(response, res);
  }
);

statisticsRouter.get(
  "/device-metrics",
  validateQueryParams(["shortUrl", "userId", "startTime", "endTime"]),
  middlewares.addDeviceMetricsRequestAttribute,
  async (req: Request, res: Response) => {
    const request: RequestModels.DeviceMetricsRequest = (req as any).request;
    const response: StatisticsResponse =
      await statisticsService.getDeviceMetricsStatistics(request);
    sendResponseToClient(response, res);
  }
);

statisticsRouter.get(
  "/geographical-metrics",
  validateQueryParams(["shortUrl", "startTime", "endTime"]),
  middlewares.addGeographicalMetricsRequestAttribute,
  async (req: Request, res: Response) => {
    const request: RequestModels.GeographicalMetricsRequest = (req as any)
      .request;
    const response: StatisticsResponse =
      await statisticsService.getGeographyMetricsStatistics(request);
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
