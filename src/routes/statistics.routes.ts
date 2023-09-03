import express, { Request, Response } from "express";
import validateParams from "../middleware/queryParamValidator.middleware";

const statisticsRouter = express.Router();

statisticsRouter.get(
  "/popular-urls",
  validateParams(["userId", "startTime", "endTime", "sortOrder", "limit"]),
  (req: Request, res: Response) => {
    const { userId, startTime, endTime, sortOrder, limit } = req.query;
    res.json({ userId, startTime, endTime, sortOrder, limit });
  }
);

statisticsRouter.get(
  "/device-metrics",
  validateParams(["startTime", "endTime"]),
  (req: Request, res: Response) => {
    const { startTime, endTime } = req.query;
    res.json({ startTime, endTime });
  }
);

statisticsRouter.get(
  "/geographical-metrics",
  validateParams(["shortUrl", "startTime", "endTime", "locationType"]),
  (req: Request, res: Response) => {
    const { shortUrl, startTime, endTime, locationType } = req.query;
    res.json({ shortUrl, startTime, endTime, locationType });
  }
);

statisticsRouter.get(
  "/ip-metrics",
  validateParams(["shortUrl", "startTime", "endTime"]),
  (req: Request, res: Response) => {
    const { shortUrl, startTime, endTime } = req.query;
    res.json({ shortUrl, startTime, endTime });
  }
);

statisticsRouter.get(
  "/redirect-stats",
  validateParams(["shortUrl", "startTime", "endTime", "eventType"]),
  (req: Request, res: Response) => {
    const { shortUrl, startTime, endTime, eventType } = req.query;
    res.json({ shortUrl, startTime, endTime, eventType });
  }
);

statisticsRouter.get(
  "/redirect-time",
  validateParams(["shortUrl", "startTime", "endTime"]),
  (req: Request, res: Response) => {
    const { shortUrl, startTime, endTime } = req.query;
    res.json({ shortUrl, startTime, endTime });
  }
);

statisticsRouter.get(
  "/url-metrics",
  validateParams(["shortUrl", "startTime", "endTime"]),
  (req: Request, res: Response) => {
    const { shortUrl, startTime, endTime } = req.query;
    res.json({ shortUrl, startTime, endTime });
  }
);

export default statisticsRouter;
