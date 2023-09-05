import dotenv from "dotenv";
import app from "./app";
import initDiscoveryClient from "./discovery-client/discoveryclient";
import { initElasticClient } from "./services/elastic/elastic.service";

dotenv.config();

const port: any = process.env.SERVER_PORT || 3000;

app.listen(port, () => {
  initDiscoveryClient();
  initElasticClient();
  // initKafka();
  console.log(`Server is listening on port: ${port}`);
});
