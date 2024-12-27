import { Eureka } from "eureka-js-client";
import { basename, dirname } from "path";
import { getLogger } from "../logger/logger";

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
  eurekaClient.start();
};

const destroyDiscoveryClient = () => {
  try {
    eurekaClient.stop();
    logger.info("Eureka Discovery Client disconnected");
  } catch (err) {
    logger.error(`Error closing discovery server: ${err}`);
  }
};

const getEurekaClient = (): Eureka => {
  const client = new Eureka({
    instance: {
      app: "urlshortener-statistics-service",
      hostName: "localhost",
      ipAddr: "127.0.0.1",
      port: {
        $: getApplicationPort(),
        "@enabled": true,
      },
      vipAddress: "urlshortener-statistics-service",
      secureVipAddress: "urlshortener-statistics-service",
      statusPageUrl: `http://localhost:${getApplicationPort()}/info`,
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
    },
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

export { initDiscoveryClient, destroyDiscoveryClient };
