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

interface LatestHitsResp {
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
}

interface LatestHitsAggResp {
  hits: LatestHitsResp[];
}

export {
  DeviceMetricResponseKey,
  EURL,
  GeneratedUrlResp,
  GeoContinentAgg,
  GeoCountry,
  LatestHitsAggResp,
  PopularUrlResponseKey,
};
