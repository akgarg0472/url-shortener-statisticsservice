import dotenv from "dotenv";
import app from "./app";
import {
  destroyDiscoveryClient,
  initDiscoveryClient,
} from "./discovery-client/discoveryclient";
import {
  destroyElasticClient,
  initElasticClient,
} from "./services/elastic/elastic.service";
import { initKafkaConsumer } from "./services/kafka/kafka.service";
import { disconnectKafkaConsumer } from "./configs/kafka.configs";

dotenv.config();

const port: any = process.env.SERVER_PORT || 7979;

const server = app.listen(port, () => {
  initDiscoveryClient();
  initElasticClient();
  initKafkaConsumer();
  console.log(`Server is listening on: ${JSON.stringify(server.address())}`);
});

const doCleanup = async () => {
  try {
    destroyDiscoveryClient();
    await destroyElasticClient();
    await disconnectKafkaConsumer();
  } catch (err) {
    console.log(`Error cleaning up resources: ${err}`);
  } finally {
    process.exit(0);
  }
};

process.on("SIGINT", doCleanup);
process.on("SIGTERM", doCleanup);
