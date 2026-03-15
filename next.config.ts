import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  reactCompiler: true,
  // GitHub Pages serves from a subpath — set basePath to match
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
};

export default nextConfig;
