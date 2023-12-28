import { Eureka } from "eureka-js-client";

const initDiscoveryClient = () => {
  const enableDiscoveryClient: string =
    process.env.ENABLE_DISCOVERY_CLIENT || "true";

  if (enableDiscoveryClient === "false") {
    return;
  }

  const eurekaClient: Eureka = getEurekaClient();
  eurekaClient.start();
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
      instanceId: "localhost:urlshortener-statistics-service",
    },
    eureka: {
      host: getEurekaServerHost(),
      port: getEurekaServerPort(),
    },
  });
  return client;
};

const getApplicationPort = (): number => {
  const port = process.env.SERVER_PORT || "3000";
  return parseInt(port);
};

const getEurekaServerPort = (): number => {
  const port = process.env.EUREKA_SERVER_PORT || "8761";
  return parseInt(port);
};

const getEurekaServerHost = (): string => {
  return process.env.EUREKA_SERVER_HOST || "localhost";
};

export default initDiscoveryClient;
