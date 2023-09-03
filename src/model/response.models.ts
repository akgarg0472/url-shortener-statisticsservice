interface StatisticsResponse {
  httpCode: number;
}

interface ErrorResponse extends StatisticsResponse {
  errors: string[];
}

interface PopularUrlStatisticsResponse extends StatisticsResponse {}

interface DeviceMetricsResponse extends StatisticsResponse {}

interface GeographicalStatisticsResponse extends StatisticsResponse {}

interface IPStatisticsResponse extends StatisticsResponse {}

interface RedirectStatisticsResponse extends StatisticsResponse {}

interface RedirectTimeStatisticsResponse extends StatisticsResponse {}

interface UrlStatisticsResponse extends StatisticsResponse {}

export {
  DeviceMetricsResponse,
  ErrorResponse,
  GeographicalStatisticsResponse,
  IPStatisticsResponse,
  PopularUrlStatisticsResponse,
  RedirectStatisticsResponse,
  RedirectTimeStatisticsResponse,
  StatisticsResponse,
  UrlStatisticsResponse,
};
