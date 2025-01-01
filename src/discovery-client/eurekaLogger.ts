import { basename, dirname } from "path";
import { getLogger } from "../logger/logger";

const logger = getLogger(
  `${basename(dirname(__filename))}/${basename(__filename)}`
);

const SUCCESSFUL_REGISTRY_RETRIEVAL = "retrieved full registry successfully";
const HEARTBEAT_SUCCESS = "eureka heartbeat success";
const CONNECTIVITY_ERROR_MESSAGE = "Eureka connectivity Error";
const REGISTERED_WITH_EUREKA_PREFIX = "registered with eureka";
const DEREGISTERED_WITH_EUREKA_PREFIX = "de-registered with eureka";

export const EurekaLogger = {
  debug(...args: any[]) {
    if (typeof args[0] !== "string" || !logger.isDebugEnabled()) {
      return;
    }

    if (args[0] === SUCCESSFUL_REGISTRY_RETRIEVAL) {
      logger.debug("Registry fetched successfully from eureka");
    }

    if (args[0] === HEARTBEAT_SUCCESS) {
      logger.debug("Eureka heartbeat successful");
    }
  },
  error(...args: any[]) {
    const connectivityError = isConnectivityError(args);

    if (connectivityError) {
      logger.error(
        `${CONNECTIVITY_ERROR_MESSAGE}: ${JSON.stringify(connectivityError)}`
      );
    }
  },
  info(...args: any[]) {
    if (typeof args[0] !== "string") {
      return;
    }

    if (args[0].startsWith(REGISTERED_WITH_EUREKA_PREFIX)) {
      logger.info(`Instance registered with eureka: ${args[1]}`);
    }

    if (args[0].startsWith(DEREGISTERED_WITH_EUREKA_PREFIX)) {
      const instanceId = args[0].substring(args[0].indexOf(":") + 1);
      logger.info(`Instance unregistered from eureka: ${instanceId})}`);
    }
  },
  warn() {},
};

const isConnectivityError = (...args: any[]): any | null => {
  if (args[0].length < 2) {
    return null;
  }

  const isCE =
    args[0][1].code === "ECONNREFUSED" &&
    args[0][1].errno === -111 &&
    args[0][1].syscall === "connect";

  if (!isCE) {
    return null;
  }

  return {
    message: args[0][0] as string,
    code: args[0][1].code as string,
    ip: args[0][1].address as string,
    port: args[0][1].port as string,
  };
};
