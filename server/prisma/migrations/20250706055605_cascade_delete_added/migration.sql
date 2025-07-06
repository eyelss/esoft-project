-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_comments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "author_id" INTEGER NOT NULL,
    "recipe_id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    CONSTRAINT "comments_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "comments_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipes" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_comments" ("author_id", "id", "recipe_id", "text") SELECT "author_id", "id", "recipe_id", "text" FROM "comments";
DROP TABLE "comments";
ALTER TABLE "new_comments" RENAME TO "comments";
CREATE TABLE "new_sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" INTEGER NOT NULL,
    "expired_at" DATETIME NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data" JSONB NOT NULL,
    CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_sessions" ("created_at", "data", "expired_at", "id", "user_id") SELECT "created_at", "data", "expired_at", "id", "user_id" FROM "sessions";
DROP TABLE "sessions";
ALTER TABLE "new_sessions" RENAME TO "sessions";
CREATE TABLE "new_step_extensions" (
    "step_id" TEXT NOT NULL PRIMARY KEY,
    "body" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    CONSTRAINT "step_extensions_step_id_fkey" FOREIGN KEY ("step_id") REFERENCES "steps" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_step_extensions" ("body", "duration", "step_id") SELECT "body", "duration", "step_id" FROM "step_extensions";
DROP TABLE "step_extensions";
ALTER TABLE "new_step_extensions" RENAME TO "step_extensions";
CREATE TABLE "new_steps" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "instruction" TEXT NOT NULL,
    "recipe_id" TEXT,
    CONSTRAINT "steps_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipes" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_steps" ("id", "instruction", "recipe_id", "title") SELECT "id", "instruction", "recipe_id", "title" FROM "steps";
DROP TABLE "steps";
ALTER TABLE "new_steps" RENAME TO "steps";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
