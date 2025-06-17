import { Recipe, Step, StepExtension } from "../../generated/prisma";
import prisma from "../db";

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