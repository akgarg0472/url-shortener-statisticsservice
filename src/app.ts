import express, { Application, Request, Response } from "express";
import statisticsRoutes from "./routes/statistics.routes";

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (req: Request, res: Response) => {
  console.log(`Request origin IP: ${req.ip}`);
  res.send("UP");
});

app.use("/statistics", statisticsRoutes);

export default app;
