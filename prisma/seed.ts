import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import {
  DEFAULT_CONTENT,
  DEFAULT_LINKS,
  DEFAULT_MENU,
  DEFAULT_DATES,
} from "../src/lib/defaults";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const contentCount = await prisma.content.count();
  if (contentCount === 0) {
    await prisma.content.create({ data: DEFAULT_CONTENT });
  }

  if ((await prisma.link.count()) === 0) {
    await prisma.link.createMany({ data: DEFAULT_LINKS });
  }

  if ((await prisma.menuItem.count()) === 0) {
    await prisma.menuItem.createMany({ data: DEFAULT_MENU });
  }

  if ((await prisma.tourDate.count()) === 0) {
    await prisma.tourDate.createMany({ data: DEFAULT_DATES });
  }

  const adminUsername = process.env.ADMIN_USERNAME ?? "admin";
  const existingAdmin = await prisma.adminUser.findUnique({
    where: { username: adminUsername },
  });
  if (!existingAdmin) {
    const password = process.env.ADMIN_PASSWORD ?? "change-me-please";
    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.adminUser.create({
      data: { username: adminUsername, passwordHash },
    });
    console.log(`Created admin user "${adminUsername}"`);
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
