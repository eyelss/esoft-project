-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_comments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "author_id" INTEGER NOT NULL,
    "recipe_id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "comments_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "comments_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipes" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_comments" ("author_id", "id", "recipe_id", "text") SELECT "author_id", "id", "recipe_id", "text" FROM "comments";
DROP TABLE "comments";
ALTER TABLE "new_comments" RENAME TO "comments";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
