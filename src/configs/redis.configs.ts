import Redis from "ioredis";
import { basename, dirname } from "path";
import { getLogger } from "../logger/logger";

const logger = getLogger(
  `${basename(dirname(__filename))}/${basename(__filename)}`
);

let redis: Redis | null = null;

const initRedisClient = () => {
  redis = new Redis({
    host: process.env["REDIS_HOST"] || "localhost",
    port: parseInt(process.env["REDIS_PORT"] || "6379"),
    password: process.env["REDIS_PASSWORD"] || "",
    db: parseInt(process.env["REDIS_DB"] || "0"),
  });

  redis.on("connect", () => {
    logger.debug("Redis connected");
  });

  redis.on("close", () => {
    logger.info("Redis connection closed");
  });

  redis.on("error", (err: Error) => {
    logger.error(`Error in redis`, { error: err });
  });

  redis.on("ready", () => {
    logger.info("Redis client is ready");
  });
};

const disconnectRedisClient = async () => {
  if (!redis) {
    return;
  }

  try {
    await redis.quit();
  } catch (err: any) {
    logger.error("Error disconnecting redis", { error: err });
  }
};

const getRedisInstance = (): Redis | null => {
  return redis;
};

export { disconnectRedisClient, getRedisInstance, initRedisClient };
