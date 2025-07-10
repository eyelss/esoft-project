import { Request } from "express";
import * as validator from "express-validator";
import prisma from "../db";

export const passwordValidator = () => validator
  .body('password')
  .isString().withMessage('Password has to be string')
  .trim()
  .isStrongPassword({
    minSymbols: 0,
  }).withMessage('Weak password');

export const loginValidator = () => validator
  .body('login')
  .isString().withMessage('Login has to be string')
  .trim()
  .isLength({ 
    min: 6,
    max: 16, 
  }).withMessage('Login has to be between 6 and 16');

export const recipeUpdateValidator = () => [
  validator.param('id')
  .isString().withMessage('Recipe ID has to be string')
  .trim()
  .isLength({ max: 25 }).withMessage('Recipe ID too big')
  .notEmpty().withMessage('Recipe ID is required')
  .custom(async (id, { req }) => {
    const request = req as Express.Request;
    
    const recipe = await prisma.recipe.findUnique({
      where: { id }
    });

    if (recipe?.authorId !== request.user.id) {
      throw new Error('You dont have right to update recipe or recipe was not found');
    }

    return true;
  })
];

export const recipeCreateValidator = () => [
  validator.body('title')
    .isString().withMessage('Title must be a string')
    .trim()
    .isLength({ min: 1, max: 100 }).withMessage('Title must be between 1 and 100 characters')
    .notEmpty().withMessage('Title is required'),
    
  validator.body('description')
    .optional()
    .isString().withMessage('Description must be a string')
    .trim()
    .isLength({ max: 500 }).withMessage('Description must be less than 500 characters'),
    
  validator.body('rootId')
    .isString().withMessage('Root ID must be a string')
    .notEmpty().withMessage('Root ID is required'),
    
  validator.body('steps')
    .isArray({ min: 1 }).withMessage('Steps must be a non-empty array')
    .custom((steps) => {
      if (!Array.isArray(steps)) {
        throw new Error('Steps must be an array');
      }
      
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        
        if (!step.tempId || typeof step.tempId !== 'string') {
          throw new Error(`Step ${i}: tempId is required and must be a string`);
        }
        
        if (!step.title || typeof step.title !== 'string') {
          throw new Error(`Step ${i}: title is required and must be a string`);
        }
        
        if (!step.instruction || typeof step.instruction !== 'string') {
          throw new Error(`Step ${i}: instruction is required and must be a string`);
        }
        
        if (step.extension) {
          if (typeof step.extension !== 'object') {
            throw new Error(`Step ${i}: extension must be an object`);
          }
          
          if (!step.extension.body || typeof step.extension.body !== 'string') {
            throw new Error(`Step ${i}: extension.body is required and must be a string`);
          }
          
          if (typeof step.extension.duration !== 'number' || step.extension.duration < 0) {
            throw new Error(`Step ${i}: extension.duration must be a non-negative number`);
          }
        }
      }
      
      return true;
    }),
    
  validator.body('relations')
    .isArray().withMessage('Relations must be an array')
    .custom((relations) => {
      if (!Array.isArray(relations)) {
        throw new Error('Relations must be an array');
      }
      
      for (let i = 0; i < relations.length; i++) {
        const relation = relations[i];
        
        if (!relation.parentId || typeof relation.parentId !== 'string') {
          throw new Error(`Relation ${i}: parentId is required and must be a string`);
        }
        
        if (!relation.childId || typeof relation.childId !== 'string') {
          throw new Error(`Relation ${i}: childId is required and must be a string`);
        }
      }
      
      return true;
    }),
    
  validator.body()
    .custom((body) => {
      // Validate that rootId exists in steps array
      const stepIds = body.steps?.map((step: any) => step.tempId) || [];
      if (!stepIds.includes(body.rootId)) {
        throw new Error('Root ID must exist in the steps array');
      }
      
      // Validate that all relation IDs exist in steps array
      const relationIds = body.relations?.flatMap((rel: any) => [rel.parentId, rel.childId]) || [];
      for (const id of relationIds) {
        if (!stepIds.includes(id)) {
          throw new Error(`Relation references non-existent step ID: ${id}`);
        }
      }
      
      return true;
    })
];