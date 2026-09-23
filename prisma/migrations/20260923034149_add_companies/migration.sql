-- Every existing user is CodeWalnut's own data (both original demo
-- accounts and the realistic demo cohort) — see docs/adr/
-- 0004-multi-tenant-companies.md and docs/features/0015-companies-roles.md.
-- This migration must be safe against the Railway deployment's existing
-- non-empty User table, not just a fresh seed, so the default company is
-- created and every existing row backfilled to it in this same migration,
-- before companyId is made required.

-- CreateTable
CREATE TABLE "Company" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Company_slug_key" ON "Company"("slug");

-- Seed the default company every existing (and future-seeded) user
-- belongs to.
INSERT INTO "Company" ("name", "slug") VALUES ('CodeWalnut', 'codewalnut');

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'learner',
    "companyId" INTEGER NOT NULL,
    CONSTRAINT "User_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_User" ("email", "id", "name", "passwordHash", "role", "companyId")
  SELECT "email", "id", "name", "passwordHash", "role",
    (SELECT "id" FROM "Company" WHERE "slug" = 'codewalnut')
  FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
