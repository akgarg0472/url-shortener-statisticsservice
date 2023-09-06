interface PopularUrlResponseKey {
  key: string;
  doc_count: number;
  success_count: {
    doc_count: number;
  };
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

export { DeviceMetricResponseKey, PopularUrlResponseKey };
