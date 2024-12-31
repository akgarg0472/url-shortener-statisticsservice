import fs from "fs";
import path from "path";
import YAML from "yaml";
import { getLocalIPAddress } from "../utils/networkUtils";

const port: any = process.env["SERVER_PORT"] || 7979;

const swaggerFile: string = fs.readFileSync(
  path.resolve(__dirname, "../swagger.yml"),
  "utf8"
);

export const swaggerSpecs = YAML.parse(
  swaggerFile.replace(
    "STATS_API_SERVER_URL",
    `http://${getLocalIPAddress()}:${port}`
  )
);
