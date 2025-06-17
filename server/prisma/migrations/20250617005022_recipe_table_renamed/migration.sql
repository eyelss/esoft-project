/*
  Warnings:

  - You are about to drop the `Recipe` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Recipe";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "recipes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "root_step_id" TEXT NOT NULL,
    CONSTRAINT "recipes_root_step_id_fkey" FOREIGN KEY ("root_step_id") REFERENCES "steps" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "recipes_root_step_id_key" ON "recipes"("root_step_id");
