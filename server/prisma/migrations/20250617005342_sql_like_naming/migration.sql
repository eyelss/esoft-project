/*
  Warnings:

  - You are about to drop the column `nextId` on the `steps_relations` table. All the data in the column will be lost.
  - You are about to drop the column `rootId` on the `steps_relations` table. All the data in the column will be lost.
  - Added the required column `next_id` to the `steps_relations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `root_id` to the `steps_relations` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_steps_relations" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "root_id" TEXT NOT NULL,
    "next_id" TEXT NOT NULL,
    CONSTRAINT "steps_relations_root_id_fkey" FOREIGN KEY ("root_id") REFERENCES "steps" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "steps_relations_next_id_fkey" FOREIGN KEY ("next_id") REFERENCES "steps" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_steps_relations" ("id") SELECT "id" FROM "steps_relations";
DROP TABLE "steps_relations";
ALTER TABLE "new_steps_relations" RENAME TO "steps_relations";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
