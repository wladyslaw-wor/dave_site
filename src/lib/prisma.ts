import { PrismaClient } from "@/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

declare global {
  var __prisma: PrismaClient | undefined;
  var __prismaConstructor: typeof PrismaClient | undefined;
}

function createClient() {
  const adapter = new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
  });
  return new PrismaClient({ adapter });
}

// HMR preserves globals even after `prisma generate` changes the client schema.
// Regeneration reloads the constructor; ordinary page edits keep it unchanged.
const cachedClient = globalThis.__prisma;
export const prisma = cachedClient && globalThis.__prismaConstructor === PrismaClient
  ? cachedClient
  : createClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__prisma = prisma;
  globalThis.__prismaConstructor = PrismaClient;
  if (cachedClient && cachedClient !== prisma) {
    void cachedClient.$disconnect().catch((error) => {
      console.error("Could not close the outdated Prisma client", error);
    });
  }
}
