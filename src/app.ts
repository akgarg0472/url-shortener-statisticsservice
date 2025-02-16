import express, { Application, Request, Response } from "express";
import swaggerUi from "swagger-ui-express";
import { swaggerSpecs } from "./configs/swagger.configs";
import {
  getMetrics,
  increaseRequestCounter,
  observeRequestDuration,
} from "./metrics";
import { PingResponse } from "./model/response.models";
import discoveryRouterV1 from "./routes/discovery.routes";
import statisticsRouterV1 from "./routes/statistics.routes.v1";

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const durationInMillis = Date.now() - start;
    const method = req.method;
    const path = req.originalUrl.split("?")[0];
    const statusCode = res.statusCode.toString();
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
  } catch (error) {
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
