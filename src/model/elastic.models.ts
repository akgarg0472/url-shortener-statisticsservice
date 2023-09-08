interface PopularUrlResponseKey {
  key: string;
  doc_count: number;
}

interface Browser {
  key: string;
  doc_count: number;
}

interface OSBrowser {
  buckets: Browser[];
}

interface DeviceMetricResponseKey {
  key: string;
  doc_count: number;
  os_browsers: OSBrowser;
}

interface GeoCity {
  key: string;
  doc_count: number;
}

interface GeoCityKey {
  buckets: GeoCity[];
}

interface GeoCountry {
  key: string;
  doc_count: number;
  cities?: GeoCityKey;
}

interface GeoCountryKey {
  buckets: GeoCountry[];
}

interface GeoContinentAgg {
  key: string;
  doc_count: number;
  countries?: GeoCountryKey;
}

interface GeneratedUrlResp {
  total: {
    value: number;
  };
  hits: EURL[];
}

interface EURL {
  _source: {
    originalUrl: string;
    shortUrl: string;
    createdAt: number;
    ipAddress: string;
  };
}

export {
  DeviceMetricResponseKey,
  EURL,
  GeneratedUrlResp,
  GeoContinentAgg,
  GeoCountry,
  PopularUrlResponseKey,
};
