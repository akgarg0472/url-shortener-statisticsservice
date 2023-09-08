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

interface UrlStatisticsResponse extends StatisticsResponse {}

interface DashboardResponse extends StatisticsResponse {
  total_hits: number;
  avg_redirect_duration: number;
  countries: CountryKey[];
  continents: ContinentKey[];
}

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
  cities?: CityKey[];
}

interface ContinentKey {
  name: string;
  hits_count: number;
  countries?: CountryKey[];
}

interface UrlMetadata {
  original_url: string;
  short_url: string;
  created_at: Date;
  ip_address: string;
}

interface GeneratedShortUrlsResponse extends StatisticsResponse {
  total_records: number;
  next_offset: number;
  urls: UrlMetadata[];
}

export {
  BrowserKey,
  CityKey,
  ContinentKey,
  CountryKey,
  DashboardResponse,
  DeviceMetricsResponse,
  ErrorResponse,
  GeneratedShortUrlsResponse,
  GeographicalStatisticsResponse,
  OSKey,
  OsBrowserKey,
  PopularUrlKey,
  PopularUrlStatisticsResponse,
  StatisticsResponse,
  UrlMetadata,
  UrlStatisticsResponse,
};
