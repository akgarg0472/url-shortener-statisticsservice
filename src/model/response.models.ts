interface StatisticsResponse {
  http_code?: number;
}

interface ErrorResponse extends StatisticsResponse {
  errors: string[];
}

interface PopularUrlStatisticsResponse extends StatisticsResponse {
  popular_urls: PopularUrlKey[];
}

interface DeviceMetricsResponse extends StatisticsResponse {
  os_browsers: OsBrowserKey[];
  browsers: BrowserKey[];
  oss: OSKey[];
}

interface GeographicalStatisticsResponse extends StatisticsResponse {
  continents: ContinentKey[];
  countries: CountryKey[];
}

interface IPStatisticsResponse extends StatisticsResponse {}

interface RedirectStatisticsResponse extends StatisticsResponse {}

interface RedirectTimeStatisticsResponse extends StatisticsResponse {}

interface UrlStatisticsResponse extends StatisticsResponse {}

interface PopularUrlKey {
  short_url: string;
  hits_count: number;
}

interface BrowserKey {
  name: string;
  hits_count: number;
}

interface OsBrowserKey {
  os_name: string;
  hits_count: number;
  browsers: BrowserKey[];
}

interface OSKey {
  name: string;
  hits_count: number;
}

interface CityKey {
  name: string;
  hits_count: number;
}

interface CountryKey {
  name: string;
  hits_count: number;
  cities: CityKey[];
}

interface ContinentKey {
  name: string;
  hits_count: number;
  countries: CountryKey[];
}

export {
  BrowserKey,
  CityKey,
  ContinentKey,
  CountryKey,
  DeviceMetricsResponse,
  ErrorResponse,
  GeographicalStatisticsResponse,
  IPStatisticsResponse,
  OSKey,
  OsBrowserKey,
  PopularUrlKey,
  PopularUrlStatisticsResponse,
  RedirectStatisticsResponse,
  RedirectTimeStatisticsResponse,
  StatisticsResponse,
  UrlStatisticsResponse,
};
