import Consul from "consul";
import { RegisterOptions } from "consul/lib/agent/service";
import { randomUUID } from "crypto";
import { basename, dirname } from "path";
import { getLogger } from "../logger/logger";
import { doCleanupAndShutdown } from "../statisticsService";
import { getEnvNumber } from "../utils/envUtils";
import { getLocalIPAddress } from "../utils/networkUtils";
import { ServiceEndpoint } from "./endpoint";

const logger = getLogger(
  `${basename(dirname(__filename))}/${basename(__filename)}`
);

const MAX_RETRIES: number = getEnvNumber("DISCOVERY_SERVER_MAX_RETRIES", 5);
let backoffTime = 1000;
let retryCount = 0;

const serviceName: string = "urlshortener-statistics-service";
const serviceId = `${serviceName}-${randomUUID().toString().replace(/-/g, "")}`;
const serviceEndpoints: ServiceEndpoint[] = [];

let serverQueryInterval: NodeJS.Timeout | null = null;
let heartbeatInterval: NodeJS.Timeout | null = null;
let discoveryClient: Consul;

export const initDiscoveryClient = async (isRetry: boolean = false) => {
  if (isRetry) {
    logger.info(`Retrying discovery client regitration: ${retryCount}`);
  }

  const enableDiscoveryClient: string =
    process.env.ENABLE_DISCOVERY_CLIENT || "true";

  if (enableDiscoveryClient === "false") {
    return;
  }

  discoveryClient = createDiscoveryClient();

  const consulRegisterOptions: RegisterOptions = {
    id: serviceId,
    name: serviceName,
    address: getLocalIPAddress(),
    port: getApplicationPort(),
    check: {
      name: `health-check`,
      timeout: "5s",
      ttl: "30s",
      deregistercriticalserviceafter: "1m",
    },
  };

  try {
    await discoveryClient.agent.service.register(consulRegisterOptions);
    logger.info("Discovery client initialized successfully");
    initDiscoveryClientQueryLoop();
    initHeartbeat();
  } catch (err: any) {
    logger.error(`Failed to initialize Discovery client: ${err}`);

    if (retryCount < MAX_RETRIES) {
      retryCount++;
      setTimeout(async () => {
        await initDiscoveryClient(true);
      }, backoffTime);
      backoffTime *= 2;
    } else {
      logger.error(
        `Discovery client retries exceeded the configured retry attempts: ${MAX_RETRIES}. Terminating application`
      );
      doCleanupAndShutdown(-1);
    }
  }
};

export const destroyDiscoveryClient = async () => {
  if (!discoveryClient) {
    logger.warn(
      "Not destroying discovery client because it is not initialized!!"
    );
    return;
  }

  try {
    await discoveryClient.agent.service.deregister(serviceId);
  } catch (err: any) {
    logger.error(`Failed to stop Discovery client: ${err}`);
  } finally {
    clearRunningIntervals();
  }
};

export const getServiceEndpoints = async (
  serviceName: string
): Promise<ServiceEndpoint[]> => {
  return serviceEndpoints.filter(
    (service) => service.serviceName === serviceName
  );
};

const initDiscoveryClientQueryLoop = () => {
  const interval = getEnvNumber(
    "DISCOVERY_SERVER_SERVER_QUERY_INTERVAL_MS",
    30000
  );

  logger.info(
    `Initializing discovery server query loop with ${interval} ms interval`
  );

  const getServiceEndpoints = async () => {
    try {
      const endpoints: ServiceEndpoint[] = [];

      Object.entries(await discoveryClient.agent.service.list())
        .filter((service) => service.length == 2)
        .forEach((service) => {
          const isSecure: any = service[1].Meta?.secure;

          const endpoint: ServiceEndpoint = {
            serviceName: service[1].Service,
            scheme: isSecure === true || isSecure === "true" ? "https" : "http",
            ip: service[1].Address,
            port: service[1].Port,
          };

          if (logger.isDebugEnabled()) {
            logger.debug(
              `Instance fetched from discovery server: ${JSON.stringify(
                endpoint
              )}`
            );
          }

          endpoints.push(endpoint);
        });

      serviceEndpoints.length = 0;
      serviceEndpoints.push(...endpoints);
    } catch (err: any) {
      logger.error("Error querying discovery server: {}", err);
    }
  };

  serverQueryInterval = setInterval(async () => {
    getServiceEndpoints();
  }, interval);

  getServiceEndpoints();
};

const createDiscoveryClient = (): Consul => {
  const consulOptions = {
    host: getDiscoveryServerHost(),
    port: getDiscoveryServerPort(),
  };
  logger.info(
    `Initializing discovery server with option: ${JSON.stringify(
      consulOptions
    )}`
  );
  return new Consul(consulOptions);
};

const getApplicationPort = (): number => {
  const port = process.env["SERVER_PORT"] || "7979";
  return parseInt(port);
};

const getDiscoveryServerPort = (): number => {
  const port = process.env["DISCOVERY_SERVER_PORT"] || "8500";
  return parseInt(port);
};

const getDiscoveryServerHost = (): string => {
  return process.env["DISCOVERY_SERVER_HOST"] || "127.0.0.1";
};

const initHeartbeat = () => {
  sendHeartbeat();
  heartbeatInterval = setInterval(() => {
    sendHeartbeat();
  }, 30000);
};

const clearRunningIntervals = () => {
  if (serverQueryInterval) {
    clearInterval(serverQueryInterval);
  }
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
  }
};

const sendHeartbeat = async () => {
  const checkId = "service:" + serviceId;

  if (logger.isDebugEnabled()) {
    logger.debug(`Sending hearbeat for ${checkId}`);
  }

  try {
    await discoveryClient.agent.check.pass({
      id: checkId,
      note: `Heartbeat from agent`,
    });
  } catch (err: any) {
    logger.error(`Error sending heartbeat: ${err}`);

    if (err instanceof Error) {
      if (err.message.includes("not found")) {
        logger.info("Service registration not found. Re-registering service");
        clearRunningIntervals();
        initDiscoveryClient();
      }
    }
  }
};
