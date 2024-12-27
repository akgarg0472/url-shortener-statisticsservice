import { EachMessageHandler, KafkaMessage } from "kafkajs";
import { basename, dirname } from "path";
import { initKafkaWithTopicAndMessageHandler } from "../../configs/kafka.configs";
import { getLogger } from "../../logger/logger";
import { EventType, StatisticsEvent } from "../../model/kafka.models";
import {
  UrlCreateStatisticsEvent,
  UrlFetchStatisticsEvent,
} from "../../model/models.events";
import { pushEventToElastic } from "../elastic/elastic.service";
import { getGeoLocation } from "../geolocation/geolocation.service";
import { getDeviceInfo } from "../ua/useragent.service";

const logger = getLogger(
  `${basename(dirname(__filename))}/${basename(__filename)}`
);

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

  const kafkaEvent: StatisticsEvent = {
    ...JSON.parse(messageString),
    timestamp: new Date().getTime(),
  };

  const indexName: string | null = determineElasticIndexName(
    kafkaEvent.eventType
  );

  if (!indexName) {
    logger.error(`Invalid index name for event push: ${indexName}`);
    return;
  }

  const statisticsEvent = getStatisticsEvent(kafkaEvent);

  if (statisticsEvent !== null) {
    pushEventToElastic(indexName, statisticsEvent);
  }
};

const getStatisticsEvent = (kafkaEvent: StatisticsEvent): any => {
  switch (kafkaEvent.eventType) {
    case EventType.URL_CREATE_SUCCESS:
    case EventType.URL_CREATE_FAILED:
      const urlCreateSuccessEvent: UrlCreateStatisticsEvent = {
        requestId: kafkaEvent.requestId,
        eventType: kafkaEvent.eventType.toString(),
        ipAddress: kafkaEvent.ipAddress,
        originalUrl: kafkaEvent.originalUrl,
        createdAt: kafkaEvent.createdAt,
        shortUrl: kafkaEvent.shortUrl,
        eventDuration: kafkaEvent.eventDuration,
        userId: kafkaEvent.userId,
        geoLocation: getGeoLocation(kafkaEvent.ipAddress),
        timestamp: kafkaEvent.timestamp,
        deviceInfo: getDeviceInfo(kafkaEvent.userAgent),
      };
      return urlCreateSuccessEvent;

    case EventType.URL_GET_SUCCESS:
    case EventType.URL_GET_FAILED:
      const urlFetchSuccessEvent: UrlFetchStatisticsEvent = {
        requestId: kafkaEvent.requestId,
        eventType: kafkaEvent.eventType.toString(),
        ipAddress: kafkaEvent.ipAddress,
        originalUrl: kafkaEvent.originalUrl,
        shortUrl: kafkaEvent.shortUrl,
        eventDuration: kafkaEvent.eventDuration,
        userId: kafkaEvent.userId,
        geoLocation: getGeoLocation(kafkaEvent.ipAddress),
        timestamp: kafkaEvent.timestamp,
        deviceInfo: getDeviceInfo(kafkaEvent.userAgent),
      };
      return urlFetchSuccessEvent;
  }
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
