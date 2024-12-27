type PopularUrlResponseKey = {
  key: string;
  doc_count: number;
  original_url: any;
};

type Browser = {
  key: string;
  doc_count: number;
};

type OSBrowser = {
  buckets: Browser[];
};

type DeviceMetricResponseKey = {
  key: string;
  doc_count: number;
  os_browsers: OSBrowser;
};

type GeoCity = {
  key: string;
  doc_count: number;
};

type GeoCityKey = {
  buckets: GeoCity[];
};

type GeoCountry = {
  key: string;
  doc_count: number;
  cities?: GeoCityKey;
};

type GeoCountryKey = {
  buckets: GeoCountry[];
};

type GeoContinentAgg = {
  key: string;
  doc_count: number;
  countries?: GeoCountryKey;
};

type GeneratedUrlResp = {
  total: {
    value: number;
  };
  hits: EURL[];
};

type EURL = {
  _source: {
    originalUrl: string;
    shortUrl: string;
    createdAt: number;
    ipAddress: string;
  };
};

type LatestHitsResp = {
  _source: {
    ipAddress: string;
    eventDuration: number;
    geoLocation: {
      continent: string;
      country: string;
      city: string;
      lat: number;
      lon: number;
      timezone: string;
    };
    timestamp: number;
    deviceInfo: { browser: string; os: string };
  };
};

type LatestHitsAggResp = {
  hits: LatestHitsResp[];
};

export {
  DeviceMetricResponseKey,
  EURL,
  GeneratedUrlResp,
  GeoContinentAgg,
  GeoCountry,
  LatestHitsAggResp,
  PopularUrlResponseKey,
};
