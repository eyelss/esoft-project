/*
  Warnings:

  - You are about to drop the `_StepRelations` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_StepRelations";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "_step_relations" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_step_relations_A_fkey" FOREIGN KEY ("A") REFERENCES "steps" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_step_relations_B_fkey" FOREIGN KEY ("B") REFERENCES "steps" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "_step_relations_AB_unique" ON "_step_relations"("A", "B");

-- CreateIndex
CREATE INDEX "_step_relations_B_index" ON "_step_relations"("B");
