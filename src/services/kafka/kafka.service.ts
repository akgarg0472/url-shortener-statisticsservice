import { EachMessageHandler, KafkaMessage } from "kafkajs";
import { initKafkaWithTopicAndMessageHandler } from "../../configs/kafka.configs";
import { EventType, StatisticsEvent } from "../../model/kafka.models";
import { pushEventToElastic } from "../elastic/elastic.service";

const initKafkaConsumer = async () => {
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

  const indexName: string | null = determineElasticIndexName(
    statisticsEvent.eventType
  );

  if (!indexName) {
    console.error(`Invalid index name for event push: ${indexName}`);
    return;
  }

  pushEventToElastic(indexName, statisticsEvent);
};

const determineElasticIndexName = (eventType: EventType): string | null => {
  if (
    eventType === EventType.URL_CREATE_SUCCESS ||
    eventType === EventType.URL_CREATE_FAILED
  ) {
    return process.env.ELASTIC_CREATE_INDEX_NAME || "urlshortener-create";
  } else if (
    eventType === EventType.URL_GET_SUCCESS ||
    eventType === EventType.URL_GET_FAILED
  ) {
    return process.env.ELASTIC_STATS_INDEX_NAME || "urlshortener-fetch";
  } else {
    return null;
  }
};

export { initKafkaConsumer };
