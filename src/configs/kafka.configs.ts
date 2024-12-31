import {
  Consumer,
  ConsumerConfig,
  ConsumerSubscribeTopics,
  DisconnectEvent,
  EachMessageHandler,
  InstrumentationEvent,
  Kafka,
  logLevel,
} from "kafkajs";
import { basename, dirname } from "path";
import { getLogger } from "../logger/logger";

const logger = getLogger(
  `${basename(dirname(__filename))}/${basename(__filename)}`
);

let kafkaConsumer: Consumer | null = null;

const createKafkaConsumer = (
  brokersUrl: string[] = ["localhost:9092"],
  loggingLevel: logLevel = logLevel.ERROR
): Consumer => {
  const kafka: Kafka = new Kafka({
    logLevel: loggingLevel,
    brokers: brokersUrl,
    clientId: "urlshortener-statistics-service-consumer-client",
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
  kafkaConsumer = createKafkaConsumer();
  await initKafkaConsumer(kafkaConsumer, topics, messageHandler);
};

export { disconnectKafkaConsumer, initKafkaWithTopicAndMessageHandler };
