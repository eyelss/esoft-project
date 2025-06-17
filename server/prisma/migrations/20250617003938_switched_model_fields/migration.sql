/*
  Warnings:

  - You are about to drop the column `recipe_id` on the `steps` table. All the data in the column will be lost.
  - Added the required column `root_step_id` to the `Recipe` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Recipe" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "root_step_id" TEXT NOT NULL,
    CONSTRAINT "Recipe_root_step_id_fkey" FOREIGN KEY ("root_step_id") REFERENCES "steps" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Recipe" ("description", "id", "title") SELECT "description", "id", "title" FROM "Recipe";
DROP TABLE "Recipe";
ALTER TABLE "new_Recipe" RENAME TO "Recipe";
CREATE UNIQUE INDEX "Recipe_root_step_id_key" ON "Recipe"("root_step_id");
CREATE TABLE "new_steps" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "prologue" TEXT NOT NULL
);
INSERT INTO "new_steps" ("description", "id", "prologue", "title") SELECT "description", "id", "prologue", "title" FROM "steps";
DROP TABLE "steps";
ALTER TABLE "new_steps" RENAME TO "steps";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
