import dotenv from "dotenv";
import express, { Application } from "express";
import initDiscoveryClient from "./discovery-client/discoveryclient";
import statisticsRoutes from "./routes/statistics.routes";
import { initElasticClient } from "./services/elastic/elastic.service";
import { initKafka } from "./services/kafka/kafka.service";

dotenv.config();

const app: Application = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/statistics", statisticsRoutes);

const port: any = process.env.SERVER_PORT || 3000;

app.listen(port, () => {
  initDiscoveryClient();
  initElasticClient();
  initKafka();
  console.log(`Server is listening on port: ${port}`);
});
