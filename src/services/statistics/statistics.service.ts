import {
  DeviceMetricsRequest,
  GeographicalMetricsRequest,
  IpMetricsRequest,
  PopularUrlsRequest,
  RedirectStatisticsRequest,
  RedirectTimeRequest,
  UrlMetricsRequest,
} from "../../model/request.models";
import {
  DeviceMetricsResponse,
  GeographicalStatisticsResponse,
  IPStatisticsResponse,
  PopularUrlStatisticsResponse,
  RedirectStatisticsResponse,
  RedirectTimeStatisticsResponse,
  StatisticsResponse,
  UrlStatisticsResponse,
} from "../../model/response.models";

const getPopularUrlsStatistics = (
  request: PopularUrlsRequest
): StatisticsResponse => {
  console.log(request);

  const response: PopularUrlStatisticsResponse = {
    httpCode: 200,
  };

  return response;
};

const getDeviceMetricsStatistics = (
  request: DeviceMetricsRequest
): StatisticsResponse => {
  console.log(request);

  const response: DeviceMetricsResponse = {
    httpCode: 200,
  };

  return response;
};

const getGeographyMetricsStatistics = (
  request: GeographicalMetricsRequest
): StatisticsResponse => {
  console.log(request);

  const response: GeographicalStatisticsResponse = {
    httpCode: 200,
  };

  return response;
};

const getIpMetricsStatistics = (
  request: IpMetricsRequest
): StatisticsResponse => {
  console.log(request);

  const response: IPStatisticsResponse = {
    httpCode: 200,
  };

  return response;
};

const getRedirectStatsStatistics = (
  request: RedirectStatisticsRequest
): StatisticsResponse => {
  console.log(request);

  const response: RedirectStatisticsResponse = {
    httpCode: 200,
  };

  return response;
};

const getRedirectTimeStatistics = (
  request: RedirectTimeRequest
): StatisticsResponse => {
  console.log(request);

  const response: RedirectTimeStatisticsResponse = {
    httpCode: 200,
  };

  return response;
};

const getUrlMetricsStatistics = (
  request: UrlMetricsRequest
): StatisticsResponse => {
  console.log(request);

  const response: UrlStatisticsResponse = {
    httpCode: 200,
  };

  return response;
};

export {
  getDeviceMetricsStatistics,
  getGeographyMetricsStatistics,
  getIpMetricsStatistics,
  getPopularUrlsStatistics,
  getRedirectStatsStatistics,
  getRedirectTimeStatistics,
  getUrlMetricsStatistics,
};
