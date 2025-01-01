import { Client } from "@elastic/elasticsearch";

const getElasticClient = (): Client => {
  const client: Client = new Client({
    node: getElasticEndpoint(),
    auth: {
      username: getUsername(),
      password: getPassword(),
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  return client;
};

const getElasticEndpoint = (): string => {
  const host = getHost();
  const port = getPort();
  return `${getProtocol()}://${host}:${port}`;
};

const getProtocol = (): string => {
  return process.env["ELASTICSEARCH_PROTOCOL"] || "http";
};

const getHost = (): string => {
  return process.env["ELASTICSEARCH_HOST"] || "localhost";
};

function getPort(): string {
  return process.env["ELASTICSEARCH_PORT"] || "9200";
}

const getUsername = (): string => {
  return process.env["ELASTICSEARCH_USERNAME"] || "elastic";
};

const getPassword = (): string => {
  return process.env["ELASTICSEARCH_PASSWORD"] || "";
};

export default getElasticClient;
