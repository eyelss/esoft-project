-- CreateTable
CREATE TABLE "Recipe" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT
);

-- CreateTable
CREATE TABLE "steps" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "recipe_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "prologue" TEXT NOT NULL,
    CONSTRAINT "steps_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "Recipe" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StepRelation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "rootId" TEXT NOT NULL,
    "nextId" TEXT NOT NULL,
    CONSTRAINT "StepRelation_rootId_fkey" FOREIGN KEY ("rootId") REFERENCES "steps" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "StepRelation_nextId_fkey" FOREIGN KEY ("nextId") REFERENCES "steps" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ExtensionStep" (
    "step_id" TEXT NOT NULL PRIMARY KEY,
    "body" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "epilogue" TEXT NOT NULL,
    CONSTRAINT "ExtensionStep_step_id_fkey" FOREIGN KEY ("step_id") REFERENCES "steps" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" INTEGER NOT NULL,
    "expired_at" DATETIME NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data" JSONB NOT NULL,
    CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_sessions" ("data", "expired_at", "id", "user_id") SELECT "data", "expired_at", "id", "user_id" FROM "sessions";
DROP TABLE "sessions";
ALTER TABLE "new_sessions" RENAME TO "sessions";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
