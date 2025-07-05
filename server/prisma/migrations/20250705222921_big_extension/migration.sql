/*
  Warnings:

  - You are about to drop the column `epilogue` on the `step_extensions` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `steps` table. All the data in the column will be lost.
  - Added the required column `author_id` to the `recipes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recipe_id` to the `steps` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "comments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "author_id" INTEGER NOT NULL,
    "recipe_id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    CONSTRAINT "comments_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "comments_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipes" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_recipes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "author_id" INTEGER NOT NULL,
    "root_step_id" TEXT NOT NULL,
    CONSTRAINT "recipes_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "recipes_root_step_id_fkey" FOREIGN KEY ("root_step_id") REFERENCES "steps" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_recipes" ("description", "id", "root_step_id", "title") SELECT "description", "id", "root_step_id", "title" FROM "recipes";
DROP TABLE "recipes";
ALTER TABLE "new_recipes" RENAME TO "recipes";
CREATE UNIQUE INDEX "recipes_root_step_id_key" ON "recipes"("root_step_id");
CREATE TABLE "new_step_extensions" (
    "step_id" TEXT NOT NULL PRIMARY KEY,
    "body" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    CONSTRAINT "step_extensions_step_id_fkey" FOREIGN KEY ("step_id") REFERENCES "steps" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_step_extensions" ("body", "duration", "step_id") SELECT "body", "duration", "step_id" FROM "step_extensions";
DROP TABLE "step_extensions";
ALTER TABLE "new_step_extensions" RENAME TO "step_extensions";
CREATE TABLE "new_steps" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "prologue" TEXT NOT NULL,
    "recipe_id" TEXT NOT NULL,
    CONSTRAINT "steps_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipes" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_steps" ("id", "prologue", "title") SELECT "id", "prologue", "title" FROM "steps";
DROP TABLE "steps";
ALTER TABLE "new_steps" RENAME TO "steps";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
