interface StatisticsResponse {
  httpCode?: number;
}

interface ErrorResponse extends StatisticsResponse {
  errors: string[];
}

interface PopularUrlStatisticsResponse extends StatisticsResponse {
  popularUrls: PopularUrlKey[];
}

interface DeviceMetricsResponse extends StatisticsResponse {}

interface GeographicalStatisticsResponse extends StatisticsResponse {}

interface IPStatisticsResponse extends StatisticsResponse {}

interface RedirectStatisticsResponse extends StatisticsResponse {}

interface RedirectTimeStatisticsResponse extends StatisticsResponse {}

interface UrlStatisticsResponse extends StatisticsResponse {}

interface PopularUrlKey {
  shortUrl: string;
  successCount: number;
}

export {
  DeviceMetricsResponse,
  ErrorResponse,
  GeographicalStatisticsResponse,
  IPStatisticsResponse,
  PopularUrlKey,
  PopularUrlStatisticsResponse,
  RedirectStatisticsResponse,
  RedirectTimeStatisticsResponse,
  StatisticsResponse,
  UrlStatisticsResponse,
};
