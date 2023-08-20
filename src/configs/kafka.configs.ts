import {
  Consumer,
  ConsumerConfig,
  ConsumerSubscribeTopics,
  EachMessageHandler,
  Kafka,
  logLevel,
} from "kafkajs";

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
  try {
    await consumer.connect();

    const topic: ConsumerSubscribeTopics = {
      topics: topics,
      fromBeginning: true,
    };

    await consumer.subscribe(topic);

    await consumer.run({
      eachMessage: messageHandler,
    });
  } catch (error) {
    console.log("Error while connecting to kafka: ", error);
  }
};

const disconnectConsumer = async (consumer: Consumer) => {
  try {
    await consumer.disconnect();
    console.log("Disconnected from kafka");
  } catch (error) {
    console.log("Error while disconnecting from kafka: ", error);
  }
};

const initKafkaWithTopicAndMessageHandler = async (
  topics: string[],
  messageHandler: EachMessageHandler
) => {
  const consumer: Consumer = createKafkaConsumer();
  await initKafkaConsumer(consumer, topics, messageHandler);
};

export { disconnectConsumer, initKafkaWithTopicAndMessageHandler };
