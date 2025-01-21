import os from "os";

export const getLocalIPAddress = (): string => {
  const interfaces = os.networkInterfaces();
  let ip = "127.0.0.1";

  for (const iface in interfaces) {
    for (const details of interfaces[iface]!) {
      if (details.family === "IPv4" && !details.internal) {
        return details.address;
      }
    }
  }

  return ip;
};
