-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Content" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "kicker" TEXT NOT NULL,
    "bio" TEXT NOT NULL,
    "releaseKicker" TEXT NOT NULL,
    "releaseTitle" TEXT NOT NULL,
    "releaseUrl" TEXT NOT NULL,
    "coverUrl" TEXT NOT NULL DEFAULT '',
    "footer" TEXT NOT NULL,
    "contactLabel" TEXT NOT NULL,
    "contactUrl" TEXT NOT NULL,
    "aboutTitle" TEXT NOT NULL,
    "aboutText" TEXT NOT NULL,
    "aboutPhoto" TEXT NOT NULL DEFAULT '',
    "videoUrl" TEXT NOT NULL DEFAULT '',
    "bgUrl" TEXT NOT NULL DEFAULT '',
    "avatarUrl" TEXT NOT NULL DEFAULT '',
    "overlay" REAL NOT NULL DEFAULT 0.62,
    "accent" TEXT NOT NULL DEFAULT '#6d1420',
    "font" TEXT NOT NULL DEFAULT 'instrument',
    "layout" TEXT NOT NULL DEFAULT 'background',
    "showTour" BOOLEAN NOT NULL DEFAULT true,
    "googleAnalyticsId" TEXT NOT NULL DEFAULT '',
    "yandexMetrikaId" TEXT NOT NULL DEFAULT '',
    "instagramUrl" TEXT NOT NULL DEFAULT '',
    "tiktokUrl" TEXT NOT NULL DEFAULT '',
    "youtubeUrl" TEXT NOT NULL DEFAULT '',
    "threadsUrl" TEXT NOT NULL DEFAULT '',
    "xUrl" TEXT NOT NULL DEFAULT '',
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Content" ("aboutPhoto", "aboutText", "aboutTitle", "accent", "avatarUrl", "bgUrl", "bio", "contactLabel", "contactUrl", "coverUrl", "font", "footer", "googleAnalyticsId", "id", "kicker", "layout", "name", "overlay", "releaseKicker", "releaseTitle", "releaseUrl", "showTour", "updatedAt", "videoUrl", "yandexMetrikaId") SELECT "aboutPhoto", "aboutText", "aboutTitle", "accent", "avatarUrl", "bgUrl", "bio", "contactLabel", "contactUrl", "coverUrl", "font", "footer", "googleAnalyticsId", "id", "kicker", "layout", "name", "overlay", "releaseKicker", "releaseTitle", "releaseUrl", "showTour", "updatedAt", "videoUrl", "yandexMetrikaId" FROM "Content";
DROP TABLE "Content";
ALTER TABLE "new_Content" RENAME TO "Content";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
