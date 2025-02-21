import net from "net";
import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import { ServerInfo } from "../serverInfo";

// --- Environment-Based Configuration ---
const validLogLevels: string[] = ["error", "warn", "info", "debug", "silly"];
const logLevel: string =
  process.env["LOGGING_LEVEL"] &&
  validLogLevels.includes(process.env["LOGGING_LEVEL"])
    ? process.env["LOGGING_LEVEL"].toLowerCase()
    : "info";
const serviceName: string = "urlshortener-statistics-service";
const enableConsoleLogging: boolean =
  process.env["LOGGING_CONSOLE_ENABLED"] === "true";
const enableFileLogging: boolean =
  process.env["LOGGING_FILE_ENABLED"] === "true";
const enableStreamingLogs: boolean =
  process.env["LOGGING_STREAM_ENABLED"] === "true";
const loggingFileBasePath: string =
  process.env["LOGGING_FILE_BASE_PATH"] || "/tmp";
const loggingStreamHost: string =
  process.env["LOGGING_STREAM_HOST"] || "localhost";
const loggingStreamPort: number = process.env["LOGGING_STREAM_PORT"]
  ? parseInt(process.env["LOGGING_STREAM_PORT"])
  : 5000;

const transports: winston.transport[] = [];

if (enableConsoleLogging) {
  transports.push(new winston.transports.Console());
}

if (enableFileLogging) {
  const fileTransport = new DailyRotateFile({
    dirname: loggingFileBasePath,
    filename: serviceName,
    extension: ".log",
    zippedArchive: true,
    frequency: "1h",
    maxFiles: "14d",
  });

  fileTransport.on("error", (err: Error) => {
    console.error("Error in file logging transport:", err);
  });

  transports.push(fileTransport);
}

if (enableStreamingLogs) {
  const socket: net.Socket = net.connect(
    Number(loggingStreamPort),
    loggingStreamHost
  );
  socket.on("error", (err: Error) => {
    console.error(`TCP Logging error:`, err);
  });
  transports.push(
    new winston.transports.Stream({
      stream: socket,
    })
  );
}

if (transports.length === 0) {
  transports.push(new winston.transports.Console());
}

const rootLogger = winston.createLogger({
  level: logLevel,
  defaultMeta: {
    service: serviceName,
  },
  format: winston.format.combine(
    winston.format.errors({
      stack: true,
    }),
    winston.format((info) => {
      info.host = ServerInfo.ip;
      info.port = ServerInfo.port;
      return info;
    })(),
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: transports,
});

/**
 * Retrieves a logger instance for the specified file.
 *
 * If a logger for the file already exists, it returns the cached instance.
 * Otherwise, it creates a new logger and caches it.
 *
 * @param loggerName - The name of the logger.
 * @returns {winston.Logger} A Winston logger instance.
 */
export const getLogger = (loggerName: string): winston.Logger => {
  return rootLogger.child({
    logger: loggerName,
  });
};
