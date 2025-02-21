import {
  AddressNotFoundError,
  City,
  Reader,
  ReaderModel,
} from "@maxmind/geoip2-node";
import { readFileSync } from "fs";
import { basename, dirname } from "path";
import { getLogger } from "../../logger/logger";
import { GeoLocationInfo } from "../../model/models.events";

const logger = getLogger(
  `${basename(dirname(__filename))}/${basename(__filename)}`
);

let geoLocationDatabaseReader: ReaderModel;

const initGeoLocation = () => {
  const databaseBuffer = readFileSync(process.env.GEOIP_DATABASE_PATH!);
  geoLocationDatabaseReader = Reader.openBuffer(databaseBuffer);
};

const getGeoLocation = (requestId: string, ip: string): GeoLocationInfo => {
  try {
    const city: City = geoLocationDatabaseReader.city(ip);

    const location: GeoLocationInfo = {
      continent: extractContinent(city),
      country: extractCountry(city),
      city: extractCity(city),
      lat: extractLat(city),
      lon: extractLon(city),
      timezone: extractTimezone(city),
    };

    return location;
  } catch (error: any) {
    if (!(error instanceof AddressNotFoundError)) {
      logger.error(`Error fetching geolocation for ip=${ip}`, {
        requestId,
        error,
      });
    }

    return {
      city: "unknown",
      country: "unknown",
      continent: "unknown",
      lat: 0.0,
      lon: 0.0,
      timezone: "unknown",
    };
  }
};

const extractContinent = (city: City): string => {
  return city.continent?.names?.en || "unknown";
};

const extractCountry = (city: City): string => {
  return city.country?.names?.en || "unknown";
};

const extractCity = (city: City): string => {
  return city.city?.names?.en || "unknown";
};

const extractLat = (city: City): number => {
  return city.location?.latitude || 0.0;
};

const extractLon = (city: City): number => {
  return city.location?.longitude || 0.0;
};

const extractTimezone = (city: City): string => {
  return city.location?.timeZone || "unknown";
};

export { getGeoLocation, initGeoLocation };
