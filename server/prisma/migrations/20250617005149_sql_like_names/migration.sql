/*
  Warnings:

  - You are about to drop the `ExtensionStep` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StepRelation` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ExtensionStep";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "StepRelation";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "steps_relations" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "rootId" TEXT NOT NULL,
    "nextId" TEXT NOT NULL,
    CONSTRAINT "steps_relations_rootId_fkey" FOREIGN KEY ("rootId") REFERENCES "steps" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "steps_relations_nextId_fkey" FOREIGN KEY ("nextId") REFERENCES "steps" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "step_extensions" (
    "step_id" TEXT NOT NULL PRIMARY KEY,
    "body" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "epilogue" TEXT NOT NULL,
    CONSTRAINT "step_extensions_step_id_fkey" FOREIGN KEY ("step_id") REFERENCES "steps" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
