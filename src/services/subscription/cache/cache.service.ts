import { basename, dirname } from "path";
import { getRedisInstance } from "../../../configs/redis.configs";
import { getLogger } from "../../../logger/logger";
import { SubscriptionDetails } from "../subscription.response";

const logger = getLogger(
  `${basename(dirname(__filename))}/${basename(__filename)}`
);

export const getSubscription = async (
  requestId: string | null,
  userId: string
): Promise<SubscriptionDetails | null> => {
  if (logger.isDebugEnabled()) {
    logger.debug(`Fetching subscription details for userId ${userId}`, {
      requestId,
    });
  }

  const instance = getRedisInstance();

  if (!instance) {
    logger.error("Redis instance is not initialized", { requestId });
    return null;
  }

  try {
    const key: string = createSubscriptionRedisKey(userId);
    const value: string | null = await instance.get(key);

    if (logger.isDebugEnabled()) {
      logger.debug(
        `Cached subscription details: ${value ? JSON.stringify(value) : null}`,
        { requestId }
      );
    }

    if (!value) {
      return null;
    }

    return JSON.parse(value);
  } catch (err: any) {
    logger.error(`Error retrieving cached subscription details:`, {
      requestId,
      error: err,
    });
    return null;
  }
};

export const addSubscription = async (
  requestId: string | null,
  userId: string,
  subscription: SubscriptionDetails
): Promise<void> => {
  if (logger.isDebugEnabled()) {
    logger.debug(`Adding subscription details for userId ${userId}`, {
      requestId,
    });
    logger.debug(`Subscription details: ${JSON.stringify(subscription)}`, {
      requestId,
    });
  }

  const instance = getRedisInstance();

  if (!instance) {
    logger.error("Redis instance is not initialized", { requestId });
    return;
  }

  try {
    const key: string = createSubscriptionRedisKey(userId);
    await instance.set(
      key,
      JSON.stringify(subscription),
      "PX",
      getTTLDuration()
    );
  } catch (err: any) {
    logger.error(`Error adding subscription in cache:`, {
      requestId,
      error: err,
    });
  }
};

const createSubscriptionRedisKey = (userId: string): string => {
  return `stats:subs:${userId}`;
};

const getTTLDuration = (): number => {
  const defaultTTL: number = 60_000;
  const randomMin: number = 1_000;
  const randomMax: number = 5_000;

  try {
    const ttl = parseInt(process.env["REDIS_TTL_DURATION_MS"] || "", 10);

    if (isNaN(ttl) || ttl <= 0) {
      return defaultTTL;
    }

    return ttl + Math.ceil(Math.random() * (randomMax - randomMin)) + randomMin;
  } catch (err: any) {
    return defaultTTL;
  }
};
