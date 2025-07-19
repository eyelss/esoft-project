-- CreateTable
CREATE TABLE "user_on_liked_recipe" (
    "user_id" INTEGER NOT NULL,
    "recipe_id" TEXT NOT NULL,

    PRIMARY KEY ("user_id", "recipe_id"),
    CONSTRAINT "user_on_liked_recipe_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "user_on_liked_recipe_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipes" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
