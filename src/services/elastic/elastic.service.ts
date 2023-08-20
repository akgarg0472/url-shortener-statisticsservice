import { Client } from "@elastic/elasticsearch";
import getElasticClient from "../../configs/elastic.configs";

let elasticClient: Client;
let elasticIndexName: string;

const initElasticClient = async () => {
  const client: Client = getElasticClient();

  await client
    .ping()
    .then(() => {
      elasticClient = client;
    })
    .catch((err) => {
      console.log("Elasticsearch is down!", err);
    });

  const indexName: string =
    process.env.ELASTICSEARCH_INDEX_NAME || "urlshortener-statistics";

  elasticIndexName = indexName;

  _createIndex(indexName);
};

const _createIndex = (indexName: string) => {
  elasticClient.indices
    .create({ index: indexName })
    .then((res) => {
      console.log(`Created index ${indexName}...`);
    })
    .catch((err) => {
      const status = err.meta?.body?.status;
      const error = err.meta?.body?.error?.type;

      if (status === 400 && error === "resource_already_exists_exception") {
        console.log(`Elastic index '${indexName}' already exists...`);
      } else {
        console.log(err);
      }
    });
};

const getDocuments = async (query: any) => {
  const response = await elasticClient.search({
    index: elasticIndexName,
    body: query,
  });

  console.log(response);
};

export { getDocuments, initElasticClient };
