import * as fs from "fs";
import path from "path";

const buildInfo = {
  buildTime: new Date().toISOString(),
};

fs.writeFileSync(
  path.join(__dirname, "build-info.json"),
  JSON.stringify(buildInfo, null, 2)
);
