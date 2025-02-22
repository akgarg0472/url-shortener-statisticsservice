import express, { Application, NextFunction, Request, Response } from "express";
import { basename, dirname } from "path";
import swaggerUi from "swagger-ui-express";
import { swaggerSpecs } from "./configs/swagger.configs";
import { getLogger } from "./logger/logger";
import {
  getMetrics,
  increaseRequestCounter,
  observeRequestDuration,
} from "./metrics";
import { PingResponse } from "./model/response.models";
import discoveryRouterV1 from "./routes/discovery.routes";
import statisticsRouterV1 from "./routes/statistics.routes.v1";
import { REQUEST_ID_HEADER } from "./utils/constants";

const logger = getLogger(
  `${basename(dirname(__filename))}/${basename(__filename)}`
);

const app: Application = express();

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use((req: Request, res: Response, next: NextFunction) => {
  const startTime = performance.now();

  res.on("finish", () => {
    const durationInMillis: number = parseFloat(
      (performance.now() - startTime).toFixed(3)
    );
    const method: string = req.method;
    const path: string = req.originalUrl.split("?")[0];
    const statusCode: string = res.statusCode.toString();
    logger.info("HTTP request", {
      method: method,
      url: path,
      status: statusCode,
      responseTime: durationInMillis,
      ip: req.ip,
      requestId: req.get(REQUEST_ID_HEADER),
    });
    increaseRequestCounter(method, path, statusCode);
    observeRequestDuration(method, path, statusCode, durationInMillis);
  });

  next();
});

app.use("/api/v1/statistics", statisticsRouterV1);

app.use("/admin", discoveryRouterV1);

app.get("/ping", (req: Request, res: Response) => {
  res.json({
    status_code: 200,
    message: "PONG",
    params: {
      ip: req.ip,
    },
  });
});

app.get("/health", (req: Request, res: Response) => {
  const pingResponse: PingResponse = {
    status_code: 200,
    message: "Server is UP and running",
    params: {
      ip: req.ip,
    },
  };

  res.json(pingResponse);
});

app.get("/api-docs", (_: Request, res: Response) => {
  res.json(swaggerSpecs);
});

app.get("/prometheus/metrics", async (req: Request, res: Response) => {
  try {
    const metrics = await getMetrics();
    res.set("Content-Type", "text/plain");
    res.send(metrics);
  } catch (err: any) {
    logger.error("Error fetching metrics:", err);
    res.status(500).send("Error fetching metrics");
  }
});

app.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpecs, {
    customSiteTitle: "URLShortener Statistics API docs",
  })
);

export default app;
