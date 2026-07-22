import type { NextConfig } from "next";

const apiEnv = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3131/api";
let apiHost = "localhost";
let apiPort = "3131";
let apiProtocol = "http";

try {
  const url = new URL(apiEnv);
  apiHost = url.hostname;
  apiPort = url.port || (url.protocol === "https:" ? "443" : "80");
  apiProtocol = url.protocol.replace(":", "");
} catch (e) {
  // Use defaults
}

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: apiProtocol as any,
        hostname: apiHost,
        port: apiPort,
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3131",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "3131",
        pathname: "/**",
      }
    ],
  },
};

export default nextConfig;
