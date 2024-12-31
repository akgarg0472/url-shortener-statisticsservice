import express, { Application } from "express";
import statisticsRouterV1 from "./routes/statistics.routes.v1";

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1/statistics", statisticsRouterV1);

export default app;
