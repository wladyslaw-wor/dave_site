-- CreateTable
CREATE TABLE "Content" (
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
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Link" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "label" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "tag" TEXT NOT NULL DEFAULT '',
    "order" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "MenuItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "label" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "TourDate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "venue" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "Click" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "count" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_username_key" ON "AdminUser"("username");
