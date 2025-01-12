type StatisticsResponse = {
  status_code?: number;
};

interface PingResponse extends StatisticsResponse {
  message: string;
  params: any;
}

interface ErrorResponse extends StatisticsResponse {
  errors: string[];
  message: string;
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

type PerDayHitStats = {
  timestamp: number;
  hits: number;
};

type LatestHit = {
  ip: string;
  redirect_duration: number;
  timestamp: number;
  device_info: { browser: string; os: string };
  location: { country: string; timezone: string };
};

interface UrlStatisticsResponse extends StatisticsResponse {
  total_hits: number;
  avg_redirect_duration: string;
  latest_hits: LatestHit[];
}

type DashboardApiStat = {
  id: string;
  key: string;
  value: string;
  suffix: string;
};

interface DashboardResponse extends StatisticsResponse {
  lifetime_stats: DashboardApiStat[];
  current_day_stats: DashboardApiStat[];
  prev_day_stats: DashboardApiStat[];
  prev_seven_days_hits: PerDayHitStats[];
}

type PopularUrlKey = {
  short_url: string;
  hits_count: number;
  original_url?: string;
};

type BrowserKey = {
  name: string;
  hits_count: number;
};

type OsBrowserKey = {
  os_name: string;
  hits_count: number;
  browsers: BrowserKey[];
};

type OSKey = {
  name: string;
  hits_count: number;
};

type CityKey = {
  name: string;
  hits_count: number;
};

type CountryKey = {
  name: string;
  hits_count: number;
  cities?: CityKey[];
};

type ContinentKey = {
  name: string;
  hits_count: number;
  countries?: CountryKey[];
};

type UrlMetadata = {
  original_url: string;
  short_url: string;
  created_at: Date;
  ip_address: string;
};

interface GeneratedShortUrlsResponse extends StatisticsResponse {
  total_records: number;
  next_offset: number;
  urls: UrlMetadata[];
}

interface UsageResponse extends StatisticsResponse {
  message: string;
  key: string;
  value: number;
}

export {
  BrowserKey,
  CityKey,
  ContinentKey,
  CountryKey,
  DashboardApiStat,
  DashboardResponse,
  DeviceMetricsResponse,
  ErrorResponse,
  GeneratedShortUrlsResponse,
  GeographicalStatisticsResponse,
  LatestHit,
  OsBrowserKey,
  OSKey,
  PerDayHitStats,
  PingResponse,
  PopularUrlKey,
  PopularUrlStatisticsResponse,
  StatisticsResponse,
  UrlMetadata,
  UrlStatisticsResponse,
  UsageResponse,
};
