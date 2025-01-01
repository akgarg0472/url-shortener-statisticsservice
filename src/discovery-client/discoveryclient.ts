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
      app: "urlshortener-statistics-service",
      hostName: hostIp,
      ipAddr: hostIp,
      port: {
        $: getApplicationPort(),
        "@enabled": true,
      },
      vipAddress: "urlshortener-statistics-service",
      secureVipAddress: "urlshortener-statistics-service",
      statusPageUrl: `http://${hostIp}:${getApplicationPort()}/info`,
      dataCenterInfo: {
        name: "MyOwn",
        "@class": "com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo",
      },
      leaseInfo: {
        renewalIntervalInSecs: 30,
        durationInSecs: 60,
      },
      instanceId: getDiscoveryServerInstanceId(),
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

const getDiscoveryServerInstanceId = (): string => {
  return `${getApplicationPort()}:urlshortener-statistics-service`;
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
