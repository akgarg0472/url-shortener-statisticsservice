import UAParser from "ua-parser-js";
import { DeviceInfo } from "../../model/models.events";

const userAgentParser: UAParser = new UAParser();

const getDeviceInfo = (userAgent: string): DeviceInfo => {
  userAgentParser.setUA(userAgent);

  const browserName = userAgentParser.getBrowser().name;
  const osName = userAgentParser.getOS().name;

  return {
    browser: browserName ? browserName : "unidentified",
    os: osName ? osName : "unidentified",
  };
};

export { getDeviceInfo };
