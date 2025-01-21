import express, { Request, Response } from "express";
import { readFileSync } from "fs";
import * as os from "os";
import path from "path";
import * as packageJson from "../../package.json";
import { getLocalIPAddress } from "../utils/networkUtils";

const discoveryRouterV1 = express.Router();

discoveryRouterV1.get("/info", async (_: Request, res: Response) => {
  const response = {
    app: {
      name: packageJson.name,
      version: packageJson.version,
      description: packageJson.description,
    },
    build: {
      "compiler.arch": os.arch(),
      "compiler.os": os.platform(),
      "node.version": packageJson.pkg.targets.join(", "),
      buildTime: getBuildTime(),
    },
    runtime: {
      node: {
        arch: os.arch(),
        version: process.version,
      },
      ip: getLocalIPAddress(),
      port: process.env.SERVER_PORT || "7979",
    },
  };
  res.status(200).json(response);
});

const getBuildTime = (): string | null => {
  try {
    const buildInfoPath: string = path.join(__dirname, "../build-info.json");
    const rawData: string = readFileSync(buildInfoPath, "utf8");
    return JSON.parse(rawData).buildTime;
  } catch (err: any) {
    return null;
  }
};

export default discoveryRouterV1;
