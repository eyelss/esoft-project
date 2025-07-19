-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_user_on_liked_recipe" (
    "user_id" INTEGER NOT NULL,
    "recipe_id" TEXT NOT NULL,

    PRIMARY KEY ("user_id", "recipe_id"),
    CONSTRAINT "user_on_liked_recipe_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "user_on_liked_recipe_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipes" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_user_on_liked_recipe" ("recipe_id", "user_id") SELECT "recipe_id", "user_id" FROM "user_on_liked_recipe";
DROP TABLE "user_on_liked_recipe";
ALTER TABLE "new_user_on_liked_recipe" RENAME TO "user_on_liked_recipe";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
