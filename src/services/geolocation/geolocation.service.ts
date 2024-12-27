import { City, Reader, ReaderModel } from "@maxmind/geoip2-node";
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

const getGeoLocation = (ip: string): GeoLocationInfo => {
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
    logger.error(`Error fetching geolocation for ip=${ip}: ${error}`);

    return {
      city: "unidentified",
      country: "unidentified",
      continent: "unidentified",
      lat: 0.0,
      lon: 0.0,
      timezone: "unidentified",
    };
  }
};

const extractContinent = (city: City): string => {
  return city.continent?.names?.en || "unidentified";
};

const extractCountry = (city: City): string => {
  return city.country?.names?.en || "unidentified";
};

const extractCity = (city: City): string => {
  return city.city?.names?.en || "unidentified";
};

const extractLat = (city: City): number => {
  return city.location?.latitude || 0.0;
};

const extractLon = (city: City): number => {
  return city.location?.longitude || 0.0;
};

const extractTimezone = (city: City): string => {
  return city.location?.timeZone || "unidentified";
};

export { getGeoLocation, initGeoLocation };
