-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Competency" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "number" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL,
    "shiftMarkdown" TEXT NOT NULL,
    "masteryBullets" TEXT NOT NULL,
    "commonMistakeMarkdown" TEXT NOT NULL,
    "toolkitTags" TEXT NOT NULL,
    "inPracticeBullets" TEXT NOT NULL DEFAULT '[]'
);
INSERT INTO "new_Competency" ("commonMistakeMarkdown", "id", "masteryBullets", "number", "shiftMarkdown", "subtitle", "title", "toolkitTags") SELECT "commonMistakeMarkdown", "id", "masteryBullets", "number", "shiftMarkdown", "subtitle", "title", "toolkitTags" FROM "Competency";
DROP TABLE "Competency";
ALTER TABLE "new_Competency" RENAME TO "Competency";
CREATE UNIQUE INDEX "Competency_number_key" ON "Competency"("number");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
