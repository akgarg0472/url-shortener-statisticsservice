import {
  Consumer,
  ConsumerConfig,
  ConsumerSubscribeTopics,
  DisconnectEvent,
  EachMessageHandler,
  InstrumentationEvent,
  Kafka,
  LogEntry,
  logLevel,
} from "kafkajs";
import { basename, dirname } from "path";
import { getLogger } from "../logger/logger";
import { getEnvNumber } from "../utils/envUtils";

const logger = getLogger(
  `${basename(dirname(__filename))}/${basename(__filename)}`
);

let kafkaConsumer: Consumer | null = null;

const createKafkaConsumer = (
  brokersUrl: string[],
  loggingLevel: string = "INFO"
): Consumer => {
  const kafkaLogLevel = getKafkaLogLevel(loggingLevel);

  const kafka: Kafka = new Kafka({
    brokers: brokersUrl,
    clientId: "urlshortener-statistics-service-consumer-client",
    retry: {
      maxRetryTime: getEnvNumber("KAFKA_MAX_RETRY_TIME_MS", 60_000),
      initialRetryTime: getEnvNumber("KAFKA_INITIAL_RETRY_TIME_MS", 1_000),
      retries: getEnvNumber("KAFKA_MAX_RETRIES", 10),
    },
    logLevel: kafkaLogLevel,
    logCreator: kafkaLogCreator,
  });

  const consumerConfig: ConsumerConfig = {
    groupId: "urlshortener-statistics-service-consumer-group",
  };

  const c: Consumer = kafka.consumer(consumerConfig);

  c.on("consumer.disconnect", (event: DisconnectEvent) => {
    logger.info("Kafka consumer disconnected successfully");
  });

  c.on("consumer.stop", (_: InstrumentationEvent<null>) => {
    logger.info("Kafka consumer stopped successfully");
  });

  return c;
};

const initKafkaConsumer = async (
  consumer: Consumer,
  topics: string[],
  messageHandler: EachMessageHandler
) => {
  await consumer.connect();

  const topic: ConsumerSubscribeTopics = {
    topics: topics,
    fromBeginning: true,
  };

  await consumer.subscribe(topic);

  await consumer.run({
    eachMessage: messageHandler,
    autoCommit: true,
    autoCommitInterval: 5000,
  });
};

const disconnectKafkaConsumer = async () => {
  try {
    if (!kafkaConsumer) {
      return;
    }

    await kafkaConsumer.stop();
    await kafkaConsumer.disconnect();
  } catch (err) {
    logger.error(`Error while disconnecting from kafka: ${err}`);
  }
};

const initKafkaWithTopicAndMessageHandler = async (
  topics: string[],
  messageHandler: EachMessageHandler
) => {
  const brokersUrl = process.env["KAFKA_BROKER_URLS"]?.split(",") || [
    "localhost:9092",
  ];
  kafkaConsumer = createKafkaConsumer(brokersUrl);
  await initKafkaConsumer(kafkaConsumer, topics, messageHandler);
};

const kafkaLogCreator = () => {
  return (entry: LogEntry) => {
    const logLevel: string = toWinstonLogLevel(entry.level);

    if (
      logger.isLevelEnabled(logLevel) &&
      entry.log.message.split(" ").length > 1
    ) {
      const { message, ...extra } = entry.log;

      logger.log({
        level: toWinstonLogLevel(entry.level),
        message,
        extra,
      });
    }
  };
};

const toWinstonLogLevel = (level: logLevel) => {
  switch (level) {
    case logLevel.ERROR:
    case logLevel.NOTHING:
      return "error";
    case logLevel.WARN:
      return "warn";
    case logLevel.INFO:
      return "info";
    case logLevel.DEBUG:
      return "debug";
    default:
      return "error";
  }
};

const getKafkaLogLevel = (loggingLevel: string): logLevel => {
  switch (loggingLevel.toUpperCase()) {
    case "ERROR":
      return logLevel.ERROR;
    case "WARN":
      return logLevel.WARN;
    case "INFO":
      return logLevel.INFO;
    case "DEBUG":
      return logLevel.DEBUG;
    default:
      return logLevel.NOTHING;
  }
};

export { disconnectKafkaConsumer, initKafkaWithTopicAndMessageHandler };
