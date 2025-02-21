import dotenv from "dotenv";
dotenv.config();

import { KafkaJSProtocolError } from "kafkajs";
import { AddressInfo } from "net";
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
} from "./discovery-client/discoveryClient";
import { ElasticInitError } from "./error/elasticError";
import { getLogger } from "./logger/logger";
import { ServerInfo } from "./serverInfo";
import {
  destroyElasticClient,
  initElasticClient,
} from "./services/elastic/elastic.service";
import { initGeoLocation } from "./services/geolocation/geolocation.service";
import { initKafkaConsumer } from "./services/kafka/kafka.service";
import { getLocalIPAddress } from "./utils/networkUtils";

const logger = getLogger(
  `${basename(dirname(__filename))}/${basename(__filename)}`
);

const server = app.listen(
  parseInt(process.env["SERVER_PORT"] ?? "0", 10),
  async () => {
    const address: AddressInfo | string | null = server.address();

    if (!address || typeof address === "string") {
      server.close(() => {
        process.exit(1);
      });
      return;
    }

    ServerInfo.ip =
      address.address === "::" || address.address === "0.0.0.0"
        ? getLocalIPAddress()
        : address.address;
    ServerInfo.port = address.port;

    logger.info(
      `Server started successfully | Environment: ${
        process.env.NODE_ENV || "development"
      } | Listening on: http://${ServerInfo.ip}:${ServerInfo.port}`
    );

    await initDiscoveryClient();
    initRedisClient();
    await initElasticClient();
    await initKafkaConsumer();
    initGeoLocation();
  }
);

export const doCleanupAndShutdown = async (exitCode: number) => {
  try {
    await destroyDiscoveryClient();
    await destroyElasticClient();
    await disconnectKafkaConsumer();
    await disconnectRedisClient();
    await new Promise((resolve) => setTimeout(resolve, 5000));
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

  if (reason instanceof KafkaJSProtocolError) {
    logger.warn(`Terminating application due to kafka error: ${reason}`);
    await doCleanupAndShutdown(-1);
    return;
  }

  logger.error(`Unhandled rejection: ${reason}`);
});

process.on("SIGINT", async () => await doCleanupAndShutdown(130));
process.on("SIGTERM", async () => await doCleanupAndShutdown(143));
