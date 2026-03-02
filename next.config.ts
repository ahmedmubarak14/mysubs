import type { NextConfig } from "next";

const isGithubActions = process.env.GITHUB_ACTIONS || false;
const repo = isGithubActions ? '/SubTrack' : '';

const nextConfig: NextConfig = {
  output: 'export',
  images: { unoptimized: true },
  basePath: repo,
  assetPrefix: repo,
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
