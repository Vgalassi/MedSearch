import type { NextConfig } from "next";
import { networkInterfaces } from "node:os";

const localIpAddresses = Object.values(networkInterfaces())
  .flatMap((addresses) => addresses ?? [])
  .filter((address) => address.family === "IPv4" && !address.internal)
  .map((address) => address.address);

const nextConfig: NextConfig = {
  allowedDevOrigins: ["localhost", "127.0.0.1", ...localIpAddresses],
};

export default nextConfig;
