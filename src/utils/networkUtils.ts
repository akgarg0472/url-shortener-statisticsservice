import os from "os";

export const getLocalIPAddress = (): string => {
  const interfaces = os.networkInterfaces();
  let ip = "localhost";

  for (const iface in interfaces) {
    for (const details of interfaces[iface]!) {
      if (details.family === "IPv4" && !details.internal) {
        ip = details.address;
        return ip;
      }
    }
  }

  return ip;
};

export const getHostName = (): string => {
  return os.hostname();
};
