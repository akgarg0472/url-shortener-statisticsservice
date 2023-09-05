import { EachMessageHandler, KafkaMessage } from "kafkajs";
import { initKafkaWithTopicAndMessageHandler } from "../../configs/kafka.configs";
import { StatisticsEvent } from "../../model/kafka.models";

const initKafka = async () => {
  const topicName: string =
    process.env.KAFKA_TOPIC_NAME || "urlshortener-statistics-events";
  initKafkaWithTopicAndMessageHandler([topicName], kafkaMessageHandler);
};

const kafkaMessageHandler: EachMessageHandler = async ({ message }) => {
  onMessage(message);
};

const onMessage = (message: KafkaMessage) => {
  const messageString = message.value?.toString();

  if (!messageString) {
    return;
  }

  const statisticsEvent: StatisticsEvent = {
    ...JSON.parse(messageString),
    timestamp: new Date().getTime(),
  };

  console.log("Statistics event received:", statisticsEvent);
};

export { initKafka, kafkaMessageHandler };
