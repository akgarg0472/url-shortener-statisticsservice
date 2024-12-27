import dotenv from "dotenv";
dotenv.config();

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
import { initGeoLocation } from "./services/geolocation/geolocation.service";
import { getLogger } from "./logger/logger";
import { basename, dirname } from "path";

const logger = getLogger(
  `${basename(dirname(__filename))}/${basename(__filename)}`
);

const port: any = process.env["SERVER_PORT"] || 7979;

const server = app.listen(port, () => {
  initDiscoveryClient();
  initElasticClient();
  initKafkaConsumer();
  initGeoLocation();
  logger.info(`Server is listening on: ${JSON.stringify(server.address())}`);
});

const doCleanup = async () => {
  try {
    destroyDiscoveryClient();
    await destroyElasticClient();
    await disconnectKafkaConsumer();
  } catch (err: any) {
    logger.error(`Error cleaning up resources: ${err}`);
  } finally {
    process.exit(0);
  }
};

process.on("SIGINT", doCleanup);
process.on("SIGTERM", doCleanup);
