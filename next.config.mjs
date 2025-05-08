import { join, dirname } from "path";
import { fileURLToPath } from "url";

/** Fix for __dirname in ESM */
const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config) {
    config.resolve.alias["@"] = join(__dirname);
    return config;
  },
};

export default nextConfig;
