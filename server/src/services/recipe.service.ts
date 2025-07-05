import { Recipe, Step, StepExtension } from "../../generated/prisma";
import prisma from "../db";

// id: string;
//   title: string;
//   description: string;
//   owner: string;
//   createdAt: string;
//   updatedAt: string;


export const getRecipes = async ({ limit = 20, offset = 0 }) => {
  return await prisma.recipe.findMany({
    skip: offset,
    take: limit,
  });
}

export const findRecipe = async (id: Recipe['id']) => {
  return await prisma.recipe.findUnique({
    where: {
      id
    }
  });
}

type createRecipeDto = {
  title: string;
};

// export const createRecipe = async () => {
//   return await prisma.recipe.create({
//     data: {
//       title
//     }
//   })
// }

type updateRecipeDto = Partial<Recipe>;

export const updateRecipe = async (id: Recipe['id'], dto: updateRecipeDto) => {
  return await prisma.recipe.update({
    where: {
      id
    },
    data: {
      ...dto
    }
  });
}
