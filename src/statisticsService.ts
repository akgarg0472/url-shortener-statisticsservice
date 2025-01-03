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
import { ElasticInitError } from "./error/elasticError";
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

const server = app.listen(port, async () => {
  initDiscoveryClient();
  initRedisClient();
  await initElasticClient();
  await initKafkaConsumer();
  initGeoLocation();
  logger.info(`Server is listening on: ${JSON.stringify(server.address())}`);
});

export const doCleanupAndShutdown = async (exitCode: number) => {
  try {
    destroyDiscoveryClient();
    await destroyElasticClient();
    await disconnectKafkaConsumer();
    await disconnectRedisClient();
  } catch (err: any) {
    logger.error(`Error cleaning up resources: ${err}`);
  } finally {
    logger.info(`Terminating process with exit code: ${exitCode}`);
    process.exit(exitCode);
  }
};

process.on(
  "uncaughtException",
  (err: Error, _: NodeJS.UncaughtExceptionOrigin) => {
    logger.error(`Uncaught exception: ${JSON.stringify(err)}`);
  }
);

process.on("unhandledRejection", async (reason: any, _: Promise<unknown>) => {
  if (reason instanceof ElasticInitError) {
    logger.warn("Terminating application because elastic search is down");
    await doCleanupAndShutdown(-1);
    return;
  }

  logger.error(`Unhandled rejection: ${reason}`);
});

process.on("SIGINT", () => doCleanupAndShutdown(130));
process.on("SIGTERM", () => doCleanupAndShutdown(143));
