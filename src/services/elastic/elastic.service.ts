import { Client } from "@elastic/elasticsearch";
import {
  AggregationsAggregate,
  SearchResponse,
} from "@elastic/elasticsearch/lib/api/types";
import getElasticClient from "../../configs/elastic.configs";
import { StatisticsEvent } from "../../model/kafka.models";

let elasticClient: Client;

const initElasticClient = async () => {
  const client: Client = getElasticClient();

  await client
    .ping()
    .then(() => {
      elasticClient = client;
    })
    .catch((err) => {
      console.error("Elasticsearch is down!", err);
    });

  const createIndexName: string =
    process.env.ELASTIC_CREATE_INDEX_NAME || "urlshortener-create";
  const elasticStatsIndexName =
    process.env.ELASTIC_STATS_INDEX_NAME || "urlshortener-fetch";

  _createIndex(createIndexName);
  _createIndex(elasticStatsIndexName);
};

const destroyElasticClient = async () => {
  try {
    await elasticClient.close();
    console.info("Disconnected from ELK");
  } catch (err) {
    console.error("Error disconnecting ELK", err);
  }
};

const _createIndex = (indexName: string) => {
  elasticClient.indices
    .create({ index: indexName })
    .then((res) => {
      console.log(`Created index ${indexName}...: ${res.acknowledged}`);
    })
    .catch((err) => {
      const status = err.meta?.body?.status;
      const error = err.meta?.body?.error?.type;

      if (status === 400 && error === "resource_already_exists_exception") {
        console.error(`Elastic index '${indexName}' already exists...`);
      } else {
        console.error(err);
      }
    });
};

const multiSearch = async (indexName: string, request: any) => {
  const response = await elasticClient.msearch({
    index: indexName,
    body: request,
  });

  return response;
};

const searchDocuments = async (
  indexName: string,
  request: any
): Promise<SearchResponse<unknown, Record<string, AggregationsAggregate>>> => {
  const response: SearchResponse<
    unknown,
    Record<string, AggregationsAggregate>
  > = await elasticClient.search({
    index: indexName,
    body: request,
  });

  return response;
};

const pushEventToElastic = async (indexName: string, event: any) => {
  await elasticClient.index({
    index: indexName,
    body: event,
  });
};

export {
  initElasticClient,
  destroyElasticClient,
  multiSearch,
  pushEventToElastic,
  searchDocuments,
};
