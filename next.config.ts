import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

await initOpenNextCloudflareForDev();

const nextConfig: NextConfig = { reactStrictMode: true };
export default nextConfig;
