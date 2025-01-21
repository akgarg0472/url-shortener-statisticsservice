import { Eureka } from "eureka-js-client";
import { basename, dirname } from "path";
import { getLogger } from "../logger/logger";
import { doCleanupAndShutdown } from "../statisticsService";
import { getEnvNumber } from "../utils/envUtils";
import { getLocalIPAddress } from "../utils/networkUtils";
import { EurekaLogger } from "./eurekaLogger";

const logger = getLogger(
  `${basename(dirname(__filename))}/${basename(__filename)}`
);

const EUREKA_APP_ID: string = "urlshortener-statistics-service";

let eurekaClient: Eureka;

const initDiscoveryClient = () => {
  const enableDiscoveryClient: string =
    process.env.ENABLE_DISCOVERY_CLIENT || "true";

  if (enableDiscoveryClient === "false") {
    return;
  }

  eurekaClient = getEurekaClient();

  eurekaClient.start((err: Error) => {
    if (err) {
      logger.error(`Failed to initialize Eureka Discovery client`);
      doCleanupAndShutdown(-1);
    }
  });
};

const destroyDiscoveryClient = () => {
  if (!eurekaClient) {
    logger.warn(
      "Not destroying discovery client because it is not initialized!!"
    );
    return;
  }

  eurekaClient.stop((err: Error) => {
    if (err) {
      logger.error(`Failed to stop Eureka Discovery client`);
    }
  });
};

const getEurekaClient = (): Eureka => {
  const hostIp = getLocalIPAddress();

  const client = new Eureka({
    instance: {
      app: EUREKA_APP_ID,
      hostName: hostIp,
      ipAddr: hostIp,
      port: {
        $: getApplicationPort(),
        "@enabled": true,
      },
      vipAddress: EUREKA_APP_ID,
      secureVipAddress: EUREKA_APP_ID,
      dataCenterInfo: {
        name: "MyOwn",
        "@class": "com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo",
      },
      leaseInfo: {
        renewalIntervalInSecs: 15,
        durationInSecs: 30,
      },
      instanceId: `${hostIp}:${EUREKA_APP_ID}:${getApplicationPort()}`,
      statusPageUrl: `http://${hostIp}:${getApplicationPort()}/admin/info`,
    },
    eureka: {
      host: getEurekaServerHost(),
      port: getEurekaServerPort(),
      registerWithEureka: true,
      fetchRegistry: true,
      maxRetries: getEnvNumber("EUREKA_MAX_RETRIES", 10),
      requestRetryDelay: getEnvNumber("EUREKA_REQUEST_RETRY_DELAY_MS", 500),
    },
    logger: EurekaLogger,
  });

  return client;
};

const getApplicationPort = (): number => {
  const port = process.env.SERVER_PORT || "7979";
  return parseInt(port);
};

const getEurekaServerPort = (): number => {
  const port = process.env.EUREKA_SERVER_PORT || "8761";
  return parseInt(port);
};

const getEurekaServerHost = (): string => {
  return process.env.EUREKA_SERVER_HOST || "127.0.0.1";
};

export { destroyDiscoveryClient, initDiscoveryClient };
