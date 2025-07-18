import { Recipe, Step, User } from "../../generated/prisma";
import prisma from "../db";

const PAGE_SIZE = 11;

type GetParams = {
  query?: string;
  author?: string;
  page: number;
  favUserId?: User['id'],
}

export const getRecipes = async (params: GetParams) => {
  const limit = PAGE_SIZE;
  const offset = PAGE_SIZE * (params.page - 1);

  return await prisma.recipe.findMany({

    include: {
      author: {
        select: {
          login: true
        }
      },
      usersLiked: true,
      _count: {
        select: { usersLiked: true }
      }
    },
    where: {
      author: {
        login: params.author,
      },
      title: {
        contains: params.query,
      },
      ...(params.favUserId !== undefined && {
        usersLiked: {
          some: { userId: params.favUserId }
        }
      })
    },
    orderBy: {
      usersLiked: {
        _count: 'desc',
      },
    },
    skip: offset,
    take: limit,
  });
}

export const findRecipe = async (id: Recipe['id']) => {
  return await prisma.recipe.findUnique({
    where: {
      id
    },
    include: {
      usersLiked: true,
      _count: {
        select: { usersLiked: true }
      },
    }
  });
}

export const findRelatedStepsWithRels = async (recipeId: Recipe['id']) => {
  return await prisma.step.findMany({
    where: {
      recipeId,
    },
    include: {
      children: true,
      parents: true,
      extension: true,
    }
  });
}

export const extractRelationsFromSteps = (steps: any[]) => {
  const relations: { parentId: string; childId: string }[] = [];
  
  steps.forEach(step => {
    step.parents.forEach((parent: any) => {
      relations.push({
        parentId: parent.id,
        childId: step.id
      });
    });
  });
  
  return relations;
}

export const getRecipeRelations = async (recipeId: Recipe['id']) => {
  const steps = await prisma.step.findMany({
    where: { recipeId },
    select: {
      id: true,
      parents: {
        select: { id: true }
      }
    }
  });
  
  const relations: { parentId: string; childId: string }[] = [];
  
  steps.forEach(step => {
    step.parents.forEach(parent => {
      relations.push({
        parentId: parent.id,
        childId: step.id
      });
    });
  });
  
  return relations;
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
      },
      include: {
        usersLiked: true,
        _count: {
          select: { usersLiked: true }
        },
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

type StepDto =
| { action: 'create', tempId: Step['id'], title: Step['title'], instruction: Step['instruction'], extension?: { body: string, duration: number } }
| { action: 'modified', id: Step['id'], title?: Step['title'], instruction?: Step['instruction'], extension?: { body: string, duration: number } }
| { action: 'delete', id: Step['id'] }

type RelationDto = { 
  action: 'create' | 'delete', 
  parentId: Step['id'], 
  childId: Step['id'] 
}

type UpdateRecipeDto = {
  recipeDto?: Omit<Partial<Recipe>, 'authorId' | 'rootStepId' | 'id'>,
  stepsDto: Array<StepDto>
  relationsDto: Array<RelationDto>
}

export const updateRecipe = async (id: Recipe['id'], dto: UpdateRecipeDto) => {
  return await prisma.$transaction(async (ctx) => {
    // update recipe title / description
    await ctx.recipe.update({
      where: {
        id
      },
      data: {
        ...dto.recipeDto,
      }
    });
    
    const stepMap = new Map<string, Step>();
    
    // creating steps
    for (const { tempId, title, instruction, extension } of dto.stepsDto.filter(stepDto => stepDto.action === 'create')) {   
      const step = await ctx.step.create({
        data: {
          title,
          instruction,
          recipeId: id,
          ...(extension && {
            extension: {
              create: {
                duration: extension.duration,
                body: extension.body,
              }
            }
          }),
        }
      });

      stepMap.set(tempId, step)
    }


    // deleting steps
    await ctx.step.deleteMany({
      where: {
        id: {
          in: dto.stepsDto.filter(stepDto => stepDto.action === 'delete').map(stepDto => stepDto.id),
        }
      }
    });


    // updating steps
    for (const { id, title, instruction, extension } of dto.stepsDto.filter(stepDto => stepDto.action === 'modified')) {
      await ctx.step.update({
        where: {
          id,
        },
        data: {
          title,
          instruction,
          ...(extension && {
            extension: {
              upsert: {
                update: { body: extension.body, duration: extension.duration },
                create: { body: extension.body, duration: extension.duration },
              }
            }
          })
        },
      });
    }

    for (const { childId, parentId, action } of dto.relationsDto) {
      switch (action) {
        case 'create':
          await ctx.step.update({
            where: { id: stepMap.get(parentId)?.id ?? parentId },
            data: {
              children: {
                connect: { id: stepMap.get(childId)?.id ?? childId },
              },
            },
          });
          break;
        case 'delete':
          await ctx.step.update({
            where: { id: stepMap.get(parentId)?.id ?? parentId },
            data: {
              children: {
                disconnect: { id: stepMap.get(childId)?.id ?? childId },
              },
            },
          });
          break;
      }
    }

    return await ctx.recipe.findUnique({ 
      where: { id }, 
      include: {
        usersLiked: true,
        _count: {
          select: { usersLiked: true }
        },
      }
    });
  });
}

export const deleteRecipe = async (id: Recipe['id']) => {
  return await prisma.recipe.delete({
    where: { id }
  });
}

export const addLike = async (recipeId: Recipe['id'], userId: User['id']) => {
  return await prisma.userOnLikedRecipe.create({
    data: {
      userId,
      recipeId,
    }
  });
}

export const deleteLike = async (recipeId: Recipe['id'], userId: User['id']) => {
  return await prisma.userOnLikedRecipe.delete({
    where: {
      userId_recipeId: {
        recipeId,
        userId,
      }
    }
  });
}