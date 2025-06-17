import { PrismaClient } from "@prisma/client";
import { Recipe, Step, StepExtension } from "../../generated/prisma";
import prisma from "../db";
import HttpError from "../errors";

type CreateStepDto = {
  title: Step['title'];
  description: Step['description'];
  prologue: Step['prologue'];

  extension?: {
    body: StepExtension['body'];
    duration: StepExtension['duration'];
    epilogue: StepExtension['epilogue'];
  }
}

const createStepByDto = async (dto: CreateStepDto, context: PrismaClient = prisma) => {
  return await prisma.step.create({
    data: {
      title: dto.title,
      description: dto.description,
      prologue: dto.prologue,
      extension: dto.extension !== undefined ? {
        create: dto.extension,
      } : undefined,
    }
  });
}

const createStepOnRecipe = async (owner: Recipe, dto: CreateStepDto) => {
  return await prisma.$transaction(async (ctx) => {
    const createdStep = await createStepByDto(dto, ctx);

    const updatedRecipe = await ctx.recipe.update({
      where: {
        id: owner.id,
      },
      data: {
        rootStepId: createdStep.id,
      }
    });

    return { createdStep, updatedRecipe };
  });
}

const createStepOnStep = async (owner: Step, dto: CreateStepDto) => {
  return await prisma.$transaction(async (ctx) => {
    const createdStep = await createStepByDto(dto, ctx);

    const updatedStep = await ctx.step.update({
      where: {
        id: owner.id,
      },
      data: {
        children: {
          connect: [{ id: createdStep.id }],
        },
      },
    });

    return { createdStep, updatedStep };
  });
}

type RemoveStepDto = {
  id: Step['id'];
}

const removeStep = async (dto: RemoveStepDto) => {
  // it should destory edges with children and parents
  // still not sure about best approach here.
  // edit mode and actual storage state are different things
  return await prisma.step.delete({
    where: { ...dto },
  })
}