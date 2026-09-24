import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep the SQLite adapter's native bindings resolvable in server builds.
  serverExternalPackages: ["@prisma/adapter-better-sqlite3"],
};

export default nextConfig;
