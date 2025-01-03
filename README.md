# URL Shortener Statistics Service

![Node.js Version](https://img.shields.io/badge/Node.js-18-green)
![TypeScript Version](https://img.shields.io/badge/TypeScript-5.1.6-blue)
![Version](https://img.shields.io/badge/version-1.2.3-white)

## Table of Contents

- [Introduction](#introduction)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Docker Setup](#docker-setup)
- [API Documentation](#api-documentation)
- [Additional Notes](#additional-notes)

## Introduction

The **URL Shortener Metrics Service** is a Node.js and TypeScript-based microservice designed to handle statistics and metrics for a URL shortener application. It interacts with **Elasticsearch** to store and query metrics data and provides REST endpoints for easy integration.

Key features include:

- Elasticsearch integration for efficient metrics storage and querying.
- RESTful API for fetching metrics and statistics.
- Eureka client for service discovery (optional).

## Prerequisites

Ensure the following are installed on your system:

- **Node.js (18+)**
- **npm or yarn**
- **Docker** (optional, for containerized setup)
- **Elasticsearch** (8.x)
- **Kafka** (for consuming events)
- **Eureka Server** (for service discovery)

## Installation

### Clone the Repository

```bash
git clone https://github.com/akgarg0472/url-shortener-statisticsservice
cd url-shortener-statisticsservice
```

### Install Dependencies

```bash
npm install
```

## Configuration

The service uses environment variables for configuration. Create a `.env` file in the root directory and define the necessary variables.

Here is an example `.env` file:

```env
NODE_ENV=DEV
LOG_LEVEL=info
LOGS_BASE_DIR=/tmp/statistics-service/
LOG_FILE_NAME=statistics.logs
SERVER_PORT=3000
KAFKA_TOPIC_NAME=urlshortener.statistics.events
KAFKA_MAX_RETRY_TIME_MS=60000
KAFKA_INITIAL_RETRY_TIME_MS=1000
KAFKA_MAX_RETRIES=10
EUREKA_SERVER_HOST=localhost
EUREKA_SERVER_PORT=8761
ENABLE_DISCOVERY_CLIENT=true
ELASTICSEARCH_USERNAME=<your_elastic_username>
ELASTICSEARCH_PASSWORD=<your_elastic_password>
ELASTICSEARCH_PROTOCOL=https
ELASTICSEARCH_HOST=localhost
ELASTICSEARCH_PORT=9200
ELASTIC_CREATE_INDEX_NAME=urlshortener.create
ELASTIC_STATS_INDEX_NAME=urlshortener.fetch
GEOIP_DATABASE_PATH=<path_to_geo_database>
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=1
REDIS_TTL_DURATION_MS=60000
```

#### General Configuration

- **NODE_ENV**: Specifies the environment (e.g., `DEV`, `PROD`).
- **LOG_LEVEL**: Logging level (e.g., `info`, `debug`, `warn`).
- **LOGS_BASE_DIR**: Base directory for log files.
- **LOG_FILE_NAME**: Log file name.
- **SERVER_PORT**: Port on which the service runs.

#### Elasticsearch Configuration

- **ELASTICSEARCH_USERNAME**: Elasticsearch username.
- **ELASTICSEARCH_PASSWORD**: Elasticsearch password.
- **ELASTICSEARCH_PROTOCOL**: Protocol used (e.g., `http`, `https`).
- **ELASTICSEARCH_HOST**: Elasticsearch host.
- **ELASTICSEARCH_PORT**: Elasticsearch port.
- **ELASTIC_CREATE_INDEX_NAME**: Index name for create metrics.
- **ELASTIC_STATS_INDEX_NAME**: Index name for fetch metrics.

#### Kafka Configuration

- **KAFKA_TOPIC_NAME**: Kafka topic for consuming events.
- **KAFKA_MAX_RETRY_TIME_MS**: The maximum total time (in milliseconds) the consumer will keep retrying a failed operation before giving up. In this case, it's set to 60,000 ms (or 1 minute).
- **KAFKA_INITIAL_RETRY_TIME_MS**: The initial time (in milliseconds) between retry attempts after a failure. In this case, it's set to 1,000 ms (or 1 second) for the first retry.
- **KAFKA_MAX_RETRIES**: The maximum number of retry attempts allowed before failing the operation. In this case, it’s set to 10 retries.

#### Eureka Configuration

- **EUREKA_SERVER_HOST**: Eureka server host.
- **EUREKA_SERVER_PORT**: Eureka server port.
- **ENABLE_DISCOVERY_CLIENT**: Enable/disable Eureka client (true/false).

#### GeoIP Database Configuration

- **GEOIP_DATABASE_PATH**: Path to the GeoIP database file for geo-location features.

#### Redis Configuration

- **REDIS_HOST**: Redis server hostname or IP address.
- **REDIS_PORT**: Redis server port (default is `6379`).
- **REDIS_PASSWORD**: Redis server authentication password (leave empty if not required).
- **REDIS_DB**: The Redis database index to use (default is `0`).
- **REDIS_TTL_DURATION_MS**: Time-to-live (TTL) in milliseconds for cache entries.

## Running the Application

### Locally

You can run the application locally by executing the following command:

```bash
npm run compile
npm run dev
```

This will start the service on defined port (default `7979`) and it will connect to the Kafka server for consuming events and API requests.

## Docker Setup

The application is Dockerized for simplified deployment. The `Dockerfile` is already configured to build and run the application.

The `Dockerfile` defines the build and runtime configuration for the container.

### Building the Docker Image

To build the Docker image, run the following command:

```bash
docker build -t akgarg0472/urlshortener-statistics-service:1.0.0 .
```

### Running the Docker Container

You can run the service with the necessary environment variables using this command:

```bash
docker run --name=urlshortener-statistics-service --network=host \
  -e NODE_ENV=DEV \
  -e LOG_LEVEL=info \
  -e LOGS_BASE_DIR=/tmp/statistics-service/ \
  -e LOG_FILE_NAME=statistics.logs \
  -e SERVER_PORT=3000 \
  -e KAFKA_TOPIC_NAME=urlshortener.statistics.events \
  -e EUREKA_SERVER_HOST=localhost \
  -e EUREKA_SERVER_PORT=8761 \
  -e ENABLE_DISCOVERY_CLIENT=true \
  -e ELASTICSEARCH_USERNAME=elastic \
  -e ELASTICSEARCH_PASSWORD=elastic \
  -e ELASTICSEARCH_PROTOCOL=https \
  -e ELASTICSEARCH_HOST=localhost \
  -e ELASTICSEARCH_PORT=9200 \
  -e ELASTIC_CREATE_INDEX_NAME=urlshortener.create \
  -e ELASTIC_STATS_INDEX_NAME=urlshortener.fetch \
  -e GEOIP_DATABASE_PATH=./geolite/GeoLite2-City.mmdb \
  -e REDIS_HOST=localhost \
  -e REDIS_PORT=6379 \
  -e REDIS_PASSWORD= \
  -e REDIS_DB=1 \
  -e REDIS_TTL_DURATION_MS=60000 \
  akgarg0472/urlshortener-statistics-service:1.0.0
```

Alternatively, you can pass the `.env` file directly to the container for easy environment variable configuration:

```bash
docker run --name=statistics-service --network=host \
           --env-file .env \
           akgarg0472/urlshortener-statistics-service:1.0.0
```

This approach simplifies the configuration by loading all environment variables from the `.env` file.

## API Documentation

The **API Documentation** for the URL Shortener Profile Service is automatically generated using **Swagger OpenAPI**
and can be accessed at the following endpoints:

1. **OpenAPI Specification**: Available at:

   ```text
   http://<host>:<port>/api-docs
   ```

   This provides the raw OpenAPI specification in JSON format, which can be used for integrations or importing into API
   tools.

2. **Swagger UI**: The user-friendly API documentation is accessible at:

   ```text
   http://<host>:<port>/docs
   ```

   Replace `<host>` and `<port>` with your application's host and port. For example, if running locally:

- OpenAPI Specification: [http://localhost:7979/api-docs](http://localhost:7979/api-docs)
- Swagger UI: [http://localhost:7979/docs](http://localhost:7979/docs)

The Swagger UI provides detailed information about the available endpoints, including request and response formats,
sample payloads, and error codes, making it easy for developers to integrate with the service.

## Additional Notes

1. **Kafka Topic Setup**:
   Pre-create the Kafka topic (`KAFKA_TOPIC_NAME`) if your Kafka setup doesn't allow auto-creation of topics. Use the Kafka CLI tool:

   ```bash
   kafka-topics --create --bootstrap-server <kafka_broker> --replication-factor 1 --partitions 1 --topic <KAFKA_TOPIC_NAME>
   ```

   Replace `<kafka_broker>` with your Kafka broker address.

2. **GeoIP Database**:

   - Download the GeoIP database from [MaxMind](https://www.maxmind.com/en/home) or any other source.
   - Set the `GEOIP_DATABASE_PATH` environment variable to the location of the GeoIP database file.
   - If you are providing the GeoLite database manually for geo-IP resolution, you must mount the location of the GeoLite database file from the host machine to the container. Use the `-v` option in the `docker run` command to map the host path to the container path specified in the `GEOIP_DATABASE_PATH` environment variable.

     #### Example:

     ```bash
     docker run --name=urlshortener-statistics-service --network=host \
        -v /path/to/host/geolite:/path/to/container/geolite \
        -e GEOIP_DATABASE_PATH=/path/to/container/geolite \
        akgarg0472/urlshortener-statistics-service:1.0.0
     ```

3. **Eureka Client (Optional)**:

   - If `ENABLE_DISCOVERY_CLIENT` is set to `true`, ensure the Eureka server is running and accessible at the specified host and port (`EUREKA_SERVER_HOST` and `EUREKA_SERVER_PORT`).
   - If you do not use Eureka, set `ENABLE_DISCOVERY_CLIENT=false` to bypass Eureka integration.

4. **Logging Directory**:
   Ensure the directory specified in `LOGS_BASE_DIR` exists and is writable by the service. If the directory does not exist, create it manually:

   ```bash
   mkdir -p /tmp/statistics-service/
   ```

## Contributions

Contributions, issues, and feature requests are welcome! Feel free to fork the repository, make your changes, and submit a pull request. Whether it's a bug fix, feature enhancement, or documentation update, we appreciate your input and collaboration.

Before submitting a pull request, please ensure that:

1. Your changes are well-documented.
2. All tests pass successfully.
3. The code adheres to the project's style guidelines.
