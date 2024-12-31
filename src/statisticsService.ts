import dotenv from "dotenv";
dotenv.config();

import { basename, dirname } from "path";
import app from "./app";
import { disconnectKafkaConsumer } from "./configs/kafka.configs";
import {
  disconnectRedisClient,
  initRedisClient,
} from "./configs/redis.configs";
import {
  destroyDiscoveryClient,
  initDiscoveryClient,
} from "./discovery-client/discoveryclient";
import { getLogger } from "./logger/logger";
import {
  destroyElasticClient,
  initElasticClient,
} from "./services/elastic/elastic.service";
import { initGeoLocation } from "./services/geolocation/geolocation.service";
import { initKafkaConsumer } from "./services/kafka/kafka.service";

const logger = getLogger(
  `${basename(dirname(__filename))}/${basename(__filename)}`
);

const port: any = process.env["SERVER_PORT"] || 7979;

const server = app.listen(port, () => {
  initDiscoveryClient();
  initRedisClient();
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
    await disconnectRedisClient();
  } catch (err: any) {
    logger.error(`Error cleaning up resources: ${err}`);
  } finally {
    process.exit(0);
  }
};

process.on(
  "uncaughtException",
  (err: Error, _: NodeJS.UncaughtExceptionOrigin) => {
    logger.error(`Uncaught exception: ${JSON.stringify(err)}`);
  }
);

process.on("unhandledRejection", (reason: any, _: Promise<unknown>) => {
  logger.error(`Unhandled rejection: ${reason}`);
});

process.on("SIGINT", doCleanup);
process.on("SIGTERM", doCleanup);
