import { Client, errors } from "@elastic/elasticsearch";
import {
  AggregationsAggregate,
  SearchResponse,
} from "@elastic/elasticsearch/lib/api/types";
import { basename, dirname } from "path";
import getElasticClient from "../../configs/elastic.configs";
import { ElasticInitError } from "../../error/elasticError";
import { getLogger } from "../../logger/logger";
import { getEnvNumber } from "../../utils/envUtils";

const logger = getLogger(
  `${basename(dirname(__filename))}/${basename(__filename)}`
);

let elasticClient: Client | null = null;

export const initElasticClient = async () => {
  const client: Client = getElasticClient();

  try {
    await client.ping();
    elasticClient = client;
  } catch (err: any) {
    if (err instanceof errors.ElasticsearchClientError) {
      logger.error(`Elasticsearch is down: ${err}`);
    }

    throw new ElasticInitError(
      "Failed to initialize ElasticSearch client",
      err
    );
  }

  logger.info("Elastic connected successfully");

  enableHealthCheck();

  const createIndexName: string =
    process.env["ELASTIC_CREATE_INDEX_NAME"] || "urlshortener-create";
  const elasticStatsIndexName =
    process.env["ELASTIC_STATS_INDEX_NAME"] || "urlshortener-fetch";

  _createIndex(createIndexName);
  _createIndex(elasticStatsIndexName);
};

export const destroyElasticClient = async () => {
  if (!elasticClient) {
    logger.warn(
      "Not destroying elastic instance because it is not initialized!!"
    );
    return;
  }

  try {
    await elasticClient.close();
    logger.info("Disconnected from ELK");
  } catch (err) {
    logger.error(`Error disconnecting ELK: ${err}`);
  }
};

const enableHealthCheck = () => {
  let healthCheckInterval = getEnvNumber(
    "ELASTIC_PING_CHECK_INTERVAL_MS",
    30_000
  );

  if (isNaN(healthCheckInterval) || healthCheckInterval <= 0) {
    logger.warn(
      "Invalid or missing 'ELASTIC_PING_CHECK_INTERVAL_MS', using default value of 30,000 ms."
    );
    healthCheckInterval = 30_000;
  }

  logger.info(
    `Initializing elastic health check at ${healthCheckInterval} ms interval`
  );

  setInterval(async () => {
    try {
      await elasticClient!.ping();

      if (logger.isDebugEnabled()) {
        logger.debug("Elastic ping successful");
      }
    } catch (err: any) {
      if (err instanceof errors.ConnectionError) {
        logger.error(`Elastic ping failed: ${err.message}`);
      }
    }
  }, healthCheckInterval);
};

export const multiSearch = async (indexName: string, request: any) => {
  return await elasticClient?.msearch({
    index: indexName,
    body: request,
  });
};

export const searchDocuments = async (
  indexName: string,
  request: any
): Promise<SearchResponse<
  unknown,
  Record<string, AggregationsAggregate>
> | null> => {
  const response:
    | SearchResponse<unknown, Record<string, AggregationsAggregate>>
    | undefined = await elasticClient?.search({
    index: indexName,
    body: request,
  });

  return response ? response : null;
};

export const pushEventToElastic = async (indexName: string, event: any) => {
  await elasticClient?.index({
    index: indexName,
    body: event,
  });
};

const _createIndex = (indexName: string) => {
  elasticClient?.indices
    .create({ index: indexName })
    .then((res) => {
      logger.info(`Created index ${indexName}...: ${res.acknowledged}`);
    })
    .catch((err) => {
      const status = err.meta?.body?.status;
      const error = err.meta?.body?.error?.type;

      if (status === 400 && error === "resource_already_exists_exception") {
        logger.warn(`Elastic index '${indexName}' already exists...`);
      } else {
        logger.error(err);
      }
    });
};
