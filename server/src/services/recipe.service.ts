import { Recipe, Step, StepExtension, User } from "../../generated/prisma";
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

type CreateStepId = string | Step['id'];

type CreateRecipeDto = {
  title: string;
  description?: string;
  authorId: User['id'];
  rootId: CreateStepId;
  steps: CreateStepDto[];
  relations: CreateRelationDto[];
}

type CreateStepDto = {
  tempId: string;
  title: string;
  instruction: string;
  extension?: {
    body: string;
    duration: number;
  }
}

type CreateRelationDto = {
  parentId: CreateStepId;
  childId: CreateStepId;
}

export const createRecipe = async (dto: CreateRecipeDto) => {
  return await prisma.$transaction(async (ctx) => {
    const stepMap = new Map<string, Step>();
    
    for (const stepDto of dto.steps) {
      const stepData: any = {
        title: stepDto.title,
        instruction: stepDto.instruction,
      };
      
      if (stepDto.extension) {
        stepData.extension = {
          create: {
            body: stepDto.extension.body,
            duration: stepDto.extension.duration,
          }
        };
      }
      
      const step = await ctx.step.create({
        data: stepData,
        include: { extension: true }
      });
      
      stepMap.set(stepDto.tempId, step);
    }
    
    const rootStep = stepMap.get(dto.rootId as string);
    
    if (!rootStep) {
      throw new Error(`Root step not found`);
    }
    
    const recipe = await ctx.recipe.create({
      data: {
        title: dto.title,
        description: dto.description,
        authorId: dto.authorId,
        rootStepId: rootStep.id,
      }
    });
    
    await Promise.all(
      Array.from(stepMap.values()).map(step =>
        ctx.step.update({
          where: { id: step.id },
          data: { recipeId: recipe.id }
        })
      )
    );
    
    for (const relation of dto.relations) {
      const parentStep = stepMap.get(relation.parentId as string);
      const childStep = stepMap.get(relation.childId as string);
      
      if (parentStep && childStep) {
        await ctx.step.update({
          where: { id: childStep.id },
          data: { parents: { connect: { id: parentStep.id } } }
        });
      }
    }
    
    return recipe;
  });
}

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
