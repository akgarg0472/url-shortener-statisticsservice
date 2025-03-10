import axios from "axios";
import { basename, dirname } from "path";
import { getServiceEndpoints } from "../../discovery-client/discoveryClient";
import { getLogger } from "../../logger/logger";
import * as cacheService from "./cache/cache.service";
import { SubscriptionDetails } from "./subscription.response";

const ALLOWED_ANALYTIC_PREFIX: string = "analytic:";
const ALL_ALLOWED_PRIVILEGE: string = ALLOWED_ANALYTIC_PREFIX + "*";
const ALLOWED_DEVICE_METRIC_PRIVILEGE: string =
  ALLOWED_ANALYTIC_PREFIX + "device";
const ALLOWED_GEOGRAPHIC_METRIC_PRIVILEGE: string =
  ALLOWED_ANALYTIC_PREFIX + "geograph";
const ALLOWED_URL_METRIC_METRIC_PRIVILEGE: string =
  ALLOWED_ANALYTIC_PREFIX + "url_metric";

const logger = getLogger(
  `${basename(dirname(__filename))}/${basename(__filename)}`
);

export const isUserAllowedToAccessResource = async (
  requestId: string | null,
  userId: string,
  resourceType: "device" | "geography" | "url"
): Promise<boolean> => {
  if (logger.isDebugEnabled()) {
    logger.debug(
      `Checking if user ${userId} is allowed to access ${resourceType} metrics`,
      {
        requestId,
      }
    );
  }

  const subscriptionDetails: SubscriptionDetails | null =
    await fetchSubscriptionDetailsForUser(requestId, userId);

  if (!subscriptionDetails) {
    logger.info(`No subscription details found for userId ${userId}`, {
      requestId,
    });
    return false;
  }

  const privileges: string[] = subscriptionDetails.pack.privileges.filter(
    (entry: string) => entry.startsWith(ALLOWED_ANALYTIC_PREFIX)
  );

  if (privileges.includes(ALL_ALLOWED_PRIVILEGE)) {
    return true;
  }

  switch (resourceType) {
    case "device":
      return privileges.some((entry) =>
        entry.startsWith(ALLOWED_DEVICE_METRIC_PRIVILEGE)
      );

    case "geography":
      return privileges.some((entry) =>
        entry.startsWith(ALLOWED_GEOGRAPHIC_METRIC_PRIVILEGE)
      );

    case "url":
      return privileges.some((entry) =>
        entry.startsWith(ALLOWED_URL_METRIC_METRIC_PRIVILEGE)
      );

    default:
      return false;
  }
};

const fetchSubscriptionDetailsForUser = async (
  requestId: string | null,
  userId: string
): Promise<SubscriptionDetails | null> => {
  let subscription = await cacheService.getSubscription(requestId, userId);

  if (subscription) {
    return subscription;
  }

  subscription = await fetchSubscriptionDetailsFromSubscriptionService(
    requestId,
    userId
  );

  if (logger.isDebugEnabled()) {
    logger.debug(
      `Subscription details fetched: ${
        subscription ? JSON.stringify(subscription) : null
      }`,
      { requestId: requestId }
    );
  }

  if (subscription) {
    cacheService.addSubscription(requestId, userId, subscription);
  }

  return subscription;
};

const fetchSubscriptionDetailsFromSubscriptionService = async (
  requestId: string | null,
  userId: string
): Promise<SubscriptionDetails | null> => {
  const subsServiceName: string =
    process.env["SUBSCRIPTION_SERVICE_NAME"] ??
    "urlshortener-subscription-service";
  const activeSubsPath: string =
    process.env["SUBSCRIPTION_SERVICE_ACTIVE_BASE_PATH"] ??
    "/api/v1/subscriptions/active";

  const endpoints = getServiceEndpoints(subsServiceName);

  for (let i = 0; i < endpoints.length; i++) {
    const { scheme, ip, port } = endpoints[i];

    const url = `${scheme}://${ip}:${port}${
      activeSubsPath.startsWith("/") ? activeSubsPath : "/" + activeSubsPath
    }?userId=${userId}`;

    if (logger.isDebugEnabled()) {
      logger.debug(`Subscription details endpoint: ${url}`, { requestId });
    }

    try {
      const response = await axios.get(url, {
        headers: {
          "X-Request-Id": requestId,
          "X-User-ID": userId,
        },
      });

      if (logger.isDebugEnabled()) {
        logger.debug(`Subscription service response code: ${response.status}`, {
          requestId,
        });
      }

      if (
        response.status === 200 &&
        response.data.subscription &&
        response.data.pack
      ) {
        const r: SubscriptionDetails = {
          subscription: {
            subscriptionId: response.data.subscription.subscription_id,
            packId: response.data.subscription.pack_id,
            expiresAt: response.data.subscription.expires_at,
          },
          pack: {
            privileges: response.data.pack.privileges,
          },
        };
        return r;
      }
    } catch (err: any) {
      logger.error(`Error fetching subscription details:`, {
        requestId,
        error: err,
      });
    }
  }

  return null;
};
