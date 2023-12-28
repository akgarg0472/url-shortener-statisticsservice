import express, { Request, Response } from "express";
import validateQueryParamsAndReturnErrorResponseIfError from "../middleware/queryParamValidator.middleware";
import * as middlewares from "../middleware/requestAttributeAdd.middleware";
import * as RequestModels from "../model/request.models";
import { PingResponse, StatisticsResponse } from "../model/response.models";
import * as statisticsService from "../services/statistics/statistics.service";

const statisticsRouterV1 = express.Router();

statisticsRouterV1.get("/health", (req: Request, res: Response) => {
  console.log();
  const pingResp: PingResponse = {
    status_code: 200,
    message: "Server is UP and running",
    params: {
      ip: req.ip,
    },
  };

  sendResponseToClient(pingResp, res);
});

statisticsRouterV1.get(
  "/dashboard-summary",
  validateQueryParamsAndReturnErrorResponseIfError([
    "userId",
    "startTime",
    "endTime",
    "currentDayStartTime",
    "currentTime",
    "oneWeekOldTime",
  ]),
  middlewares.addSummaryRequestAttribute,
  async (req: Request, res: Response) => {
    const request: RequestModels.DashboardRequest = (req as any).request;
    const response: StatisticsResponse =
      await statisticsService.getSummaryStatistics(request);
    sendResponseToClient(response, res);
  }
);

statisticsRouterV1.get(
  "/generated-urls",
  validateQueryParamsAndReturnErrorResponseIfError([
    "userId",
    "limit",
    "offset",
  ]),
  middlewares.addGeneratedShortUrlsRequestAttribute,
  async (req: Request, res: Response) => {
    const request: RequestModels.GeneratedShortUrlsRequest = (req as any)
      .request;
    const response: StatisticsResponse =
      await statisticsService.getGeneratedShortUrls(request);
    sendResponseToClient(response, res);
  }
);

statisticsRouterV1.get(
  "/popular-urls",
  validateQueryParamsAndReturnErrorResponseIfError([
    "userId",
    "startTime",
    "endTime",
  ]),
  middlewares.addPopularUrlRequestAttribute,
  async (req: Request, res: Response) => {
    const request: RequestModels.PopularUrlsRequest = (req as any).request;
    const response: StatisticsResponse =
      await statisticsService.getPopularUrlsStatistics(request);
    sendResponseToClient(response, res);
  }
);

statisticsRouterV1.get(
  "/url-metrics",
  validateQueryParamsAndReturnErrorResponseIfError([
    "userId",
    "shortUrl",
    "startTime",
    "limit",
    "endTime",
  ]),
  middlewares.addUrlMetricsRequestAttribute,
  async (req: Request, res: Response) => {
    const request: RequestModels.UrlMetricsRequest = (req as any).request;
    const response: StatisticsResponse =
      await statisticsService.getUrlStatistics(request);
    sendResponseToClient(response, res);
  }
);

statisticsRouterV1.get(
  "/device-metrics",
  validateQueryParamsAndReturnErrorResponseIfError([
    "shortUrl",
    "userId",
    "startTime",
    "endTime",
  ]),
  middlewares.addDeviceMetricsRequestAttribute,
  async (req: Request, res: Response) => {
    const request: RequestModels.DeviceMetricsRequest = (req as any).request;
    const response: StatisticsResponse =
      await statisticsService.getDeviceMetricsStatistics(request);
    sendResponseToClient(response, res);
  }
);

statisticsRouterV1.get(
  "/geographical-metrics",
  validateQueryParamsAndReturnErrorResponseIfError([
    "shortUrl",
    "startTime",
    "endTime",
  ]),
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
  if (response.status_code) {
    res.status(response.status_code);
  }

  res.json(response);
};

export default statisticsRouterV1;
