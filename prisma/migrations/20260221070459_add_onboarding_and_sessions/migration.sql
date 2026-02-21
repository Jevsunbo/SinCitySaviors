/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `User` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" DATETIME,
    "duration" INTEGER,
    "peakRiskScore" REAL NOT NULL DEFAULT 0,
    "finalBankroll" REAL,
    "aceTriggered" BOOLEAN NOT NULL DEFAULT false,
    "userAccepted" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ageVerified" BOOLEAN NOT NULL DEFAULT false,
    "budgetLimit" REAL,
    "timeLimit" INTEGER,
    "preferredActivities" TEXT,
    "onboardingMood" TEXT,
    "onboardingStress" TEXT,
    "onboardingIntent" TEXT,
    "baselineRiskModifier" INTEGER NOT NULL DEFAULT 0,
    "totalSessions" INTEGER NOT NULL DEFAULT 0,
    "avgSessionDuration" REAL NOT NULL DEFAULT 0,
    "avgRiskScore" REAL NOT NULL DEFAULT 0,
    "aceInterventions" INTEGER NOT NULL DEFAULT 0,
    "aceAccepted" INTEGER NOT NULL DEFAULT 0,
    "lastSessionAt" DATETIME
);
INSERT INTO "new_User" ("createdAt", "email", "id", "name") SELECT "createdAt", "email", "id", "name" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
