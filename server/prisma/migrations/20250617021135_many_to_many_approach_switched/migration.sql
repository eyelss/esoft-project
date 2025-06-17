/*
  Warnings:

  - You are about to drop the `steps_relations` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "steps_relations";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "_StepRelations" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_StepRelations_A_fkey" FOREIGN KEY ("A") REFERENCES "steps" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_StepRelations_B_fkey" FOREIGN KEY ("B") REFERENCES "steps" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "_StepRelations_AB_unique" ON "_StepRelations"("A", "B");

-- CreateIndex
CREATE INDEX "_StepRelations_B_index" ON "_StepRelations"("B");
