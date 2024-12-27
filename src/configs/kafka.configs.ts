import {
  Consumer,
  ConsumerConfig,
  ConsumerSubscribeTopics,
  EachMessageHandler,
  Kafka,
  logLevel,
} from "kafkajs";
import { basename, dirname } from "path";
import { getLogger } from "../logger/logger";

const logger = getLogger(
  `${basename(dirname(__filename))}/${basename(__filename)}`
);

let kafkaConsumer: Consumer;

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

  const consumer: Consumer = kafka.consumer(consumerConfig);

  return consumer;
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
    await kafkaConsumer.disconnect();
    logger.info("Disconnected from kafka");
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
