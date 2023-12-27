import express, { Application, Request, Response } from "express";
import statisticsRouterV1 from "./routes/statistics.routes.v1";

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (req: Request, res: Response) => {
  console.log(`Request origin IP: ${req.ip}`);
  res.send("UP");
});

app.use("/api/v1/statistics", statisticsRouterV1);

export default app;
