/*
  Warnings:

  - You are about to drop the column `prologue` on the `steps` table. All the data in the column will be lost.
  - Added the required column `instruction` to the `steps` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_steps" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "instruction" TEXT NOT NULL,
    "recipe_id" TEXT NOT NULL,
    CONSTRAINT "steps_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipes" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_steps" ("id", "recipe_id", "title") SELECT "id", "recipe_id", "title" FROM "steps";
DROP TABLE "steps";
ALTER TABLE "new_steps" RENAME TO "steps";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
