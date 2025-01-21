import express, { Application, Request, Response } from "express";
import swaggerUi from "swagger-ui-express";
import { swaggerSpecs } from "./configs/swagger.configs";
import { PingResponse } from "./model/response.models";
import discoveryRouterV1 from "./routes/discovery.routes";
import statisticsRouterV1 from "./routes/statistics.routes.v1";

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

app.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpecs, {
    customSiteTitle: "URLShortener Statistics API docs",
  })
);

export default app;
