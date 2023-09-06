interface StatisticsResponse {
  httpCode?: number;
}

interface ErrorResponse extends StatisticsResponse {
  errors: string[];
}

interface PopularUrlStatisticsResponse extends StatisticsResponse {
  popularUrls: PopularUrlKey[];
}

interface DeviceMetricsResponse extends StatisticsResponse {
  osBrowsers: OsBrowserKey[];
}

interface GeographicalStatisticsResponse extends StatisticsResponse {}

interface IPStatisticsResponse extends StatisticsResponse {}

interface RedirectStatisticsResponse extends StatisticsResponse {}

interface RedirectTimeStatisticsResponse extends StatisticsResponse {}

interface UrlStatisticsResponse extends StatisticsResponse {}

interface PopularUrlKey {
  shortUrl: string;
  successCount: number;
}

interface BrowserKey {
  name: string;
  count: number;
}

interface OsBrowserKey {
  osName: string;
  count: number;
  browsers: BrowserKey[];
}

export {
  BrowserKey,
  DeviceMetricsResponse,
  ErrorResponse,
  GeographicalStatisticsResponse,
  IPStatisticsResponse,
  OsBrowserKey,
  PopularUrlKey,
  PopularUrlStatisticsResponse,
  RedirectStatisticsResponse,
  RedirectTimeStatisticsResponse,
  StatisticsResponse,
  UrlStatisticsResponse,
};
