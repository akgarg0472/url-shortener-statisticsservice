import { basename, dirname } from "path";
import { getRedisInstance } from "../../configs/redis.configs";
import { getLogger } from "../../logger/logger";
import * as RequestModels from "../../model/request.models";
import * as ResponseModel from "../../model/response.models";

const logger = getLogger(
  `${basename(dirname(__filename))}/${basename(__filename)}`
);

export const getCachedSummaryStatistics = async (
  request: RequestModels.DashboardRequest
): Promise<ResponseModel.DashboardResponse | null> => {
  const instance = getRedisInstance();

  if (!instance) {
    return null;
  }

  try {
    const key: string = createSummaryStatsKey(request);
    const value: string | null = await instance.get(key);

    if (!value) {
      return null;
    }

    return JSON.parse(value);
  } catch (err: any) {
    logger.error(`Error retrieving cached summary statistics: ${err}`);
    return null;
  }
};

export const getCachedGeneratedShortUrls = async (
  request: RequestModels.GeneratedShortUrlsRequest
): Promise<ResponseModel.GeneratedShortUrlsResponse | null> => {
  const instance = getRedisInstance();

  if (!instance) {
    return null;
  }

  try {
    const key: string = createGeneratedShortUrlsKey(request);
    const value: string | null = await instance.get(key);

    if (!value) {
      return null;
    }

    return JSON.parse(value);
  } catch (err: any) {
    logger.error(`Error retrieving cached short URLs statistics: ${err}`);
    return null;
  }
};

export const getCachedPopularUrls = async (
  request: RequestModels.PopularUrlsRequest
): Promise<ResponseModel.PopularUrlStatisticsResponse | null> => {
  const instance = getRedisInstance();

  if (!instance) {
    return null;
  }

  try {
    const key: string = createPopularUrlsKey(request);
    const value: string | null = await instance.get(key);

    if (!value) {
      return null;
    }

    return JSON.parse(value);
  } catch (err: any) {
    logger.error(`Error retrieving cached popular URLs statistics: ${err}`);
    return null;
  }
};

export const getCachedUrlStatistics = async (
  request: RequestModels.UrlMetricsRequest
): Promise<ResponseModel.UrlStatisticsResponse | null> => {
  const instance = getRedisInstance();

  if (!instance) {
    return null;
  }

  try {
    const key: string = createUrlStatisticsKey(request);
    const value: string | null = await instance.get(key);

    if (!value) {
      return null;
    }

    return JSON.parse(value);
  } catch (err: any) {
    logger.error(`Error retrieving cached URL statistics: ${err}`);
    return null;
  }
};

export const getCachedDeviceMetrics = async (
  request: RequestModels.DeviceMetricsRequest
): Promise<ResponseModel.DeviceMetricsResponse | null> => {
  const instance = getRedisInstance();

  if (!instance) {
    return null;
  }

  try {
    const key: string = createDeviceMetricsKey(request);
    const value: string | null = await instance.get(key);

    if (!value) {
      return null;
    }

    return JSON.parse(value);
  } catch (err: any) {
    logger.error(`Error retrieving cached device statistics: ${err}`);
    return null;
  }
};

export const getCachedGeographyMetrics = async (
  request: RequestModels.GeographicalMetricsRequest
): Promise<ResponseModel.GeographicalStatisticsResponse | null> => {
  const instance = getRedisInstance();

  if (!instance) {
    return null;
  }

  try {
    const key: string = createGeographicMetricsKey(request);
    const value: string | null = await instance.get(key);

    if (!value) {
      return null;
    }

    return JSON.parse(value);
  } catch (err: any) {
    logger.error(`Error retrieving cached geography statistics: ${err}`);
    return null;
  }
};

export const setCachedSummaryStatistics = async (
  request: RequestModels.DashboardRequest,
  response: ResponseModel.DashboardResponse
): Promise<void> => {
  const instance = getRedisInstance();

  if (!instance) {
    return;
  }

  try {
    const key = createSummaryStatsKey(request);
    await instance.set(key, JSON.stringify(response), "PX", getTTLDuration());
  } catch (err: any) {
    logger.error(`Error caching dashboard summary statistics: ${err}`);
  }
};

export const setCachedGeneratedShortUrls = async (
  request: RequestModels.GeneratedShortUrlsRequest,
  response: ResponseModel.GeneratedShortUrlsResponse
): Promise<void> => {
  const instance = getRedisInstance();

  if (!instance) {
    return;
  }

  try {
    const key = createGeneratedShortUrlsKey(request);
    await instance.set(key, JSON.stringify(response), "PX", getTTLDuration());
  } catch (err: any) {
    logger.error(`Error caching generating short URLs statistics: ${err}`);
  }
};

export const setCachedPopularUrls = async (
  request: RequestModels.PopularUrlsRequest,
  response: ResponseModel.PopularUrlStatisticsResponse
): Promise<void> => {
  const instance = getRedisInstance();

  if (!instance) {
    return;
  }

  try {
    const key = createPopularUrlsKey(request);
    await instance.set(key, JSON.stringify(response), "PX", getTTLDuration());
  } catch (err: any) {
    logger.error(`Error caching popular URLs statistics: ${err}`);
  }
};

export const setCachedUrlStatistics = async (
  request: RequestModels.UrlMetricsRequest,
  response: ResponseModel.UrlStatisticsResponse
): Promise<void> => {
  const instance = getRedisInstance();

  if (!instance) {
    return;
  }

  try {
    const key = createUrlStatisticsKey(request);
    await instance.set(key, JSON.stringify(response), "PX", getTTLDuration());
  } catch (err: any) {
    logger.error(`Error caching URL statistics: ${err}`);
  }
};

export const setCachedDeviceMetrics = async (
  request: RequestModels.DeviceMetricsRequest,
  response: ResponseModel.DeviceMetricsResponse
): Promise<void> => {
  const instance = getRedisInstance();

  if (!instance) {
    return;
  }

  try {
    const key = createDeviceMetricsKey(request);
    await instance.set(key, JSON.stringify(response), "PX", getTTLDuration());
  } catch (err: any) {
    logger.error(`Error caching device metrics statistics: ${err}`);
  }
};

export const setCachedGeographicMetrics = async (
  request: RequestModels.GeographicalMetricsRequest,
  response: ResponseModel.GeographicalStatisticsResponse
): Promise<void> => {
  const instance = getRedisInstance();

  if (!instance) {
    return;
  }

  try {
    const key = createGeographicMetricsKey(request);
    await instance.set(key, JSON.stringify(response), "PX", getTTLDuration());
  } catch (err: any) {
    logger.error(`Error caching geography metrics statistics: ${err}`);
  }
};

const getTTLDuration = (): number => {
  const defaultTTL: number = 60_000;
  const randomMin: number = 1_000;
  const randomMax: number = 5_000;

  try {
    const ttl = parseInt(process.env["REDIS_TTL_DURATION_MS"] || "", 10);

    if (isNaN(ttl) || ttl <= 0) {
      return defaultTTL;
    }

    return ttl + Math.ceil(Math.random() * (randomMax - randomMin)) + randomMin;
  } catch (err: any) {
    return defaultTTL;
  }
};

const createSummaryStatsKey = (
  request: RequestModels.DashboardRequest
): string => {
  return `stats:dashboard_summary:${request.userId}:${request.currentDayStartTime}`;
};

const createGeneratedShortUrlsKey = (
  request: RequestModels.GeneratedShortUrlsRequest
): string => {
  return `stats:generated_short_urls:${request.userId}:${request.limit}:${request.offset}`;
};

const createPopularUrlsKey = (
  request: RequestModels.PopularUrlsRequest
): string => {
  return `stats:popular_urls:${request.userId}:${request.startTime}:${request.sortOrder}:${request.limit}`;
};

const createUrlStatisticsKey = (
  request: RequestModels.UrlMetricsRequest
): string => {
  return `stats:url:${request.shortUrl}:${request.startTime}:${request.limit}`;
};

const createDeviceMetricsKey = (
  request: RequestModels.DeviceMetricsRequest
): string => {
  return `stats:device:${request.userId}:${request.startTime}`;
};

const createGeographicMetricsKey = (
  request: RequestModels.GeographicalMetricsRequest
): string => {
  return `stats:geography:${request.userId}:${request.startTime}`;
};
