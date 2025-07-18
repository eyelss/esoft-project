import { Router, Request, Response, NextFunction } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { handleValidationErrors } from "../middlewares/validation.middleware";
import { recipeCreateValidator, recipesQueryValidator, recipeUpdateValidator } from "../utils/validators";
import { createRecipe, getRecipes, findRecipe, findRelatedStepsWithRels, extractRelationsFromSteps, deleteRecipe, updateRecipe } from "../services/recipe.service";
import { findUserById } from "../services/user.service";
import HttpError from "../errors";
import { weakAuthMiddleware } from "../middlewares/weak.auth.middleware";

const router = Router();

router.use(weakAuthMiddleware);

router.get(
  '/',
  recipesQueryValidator(),
  handleValidationErrors,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.p as string) || 1;
      const query = req.query.q as string | undefined;
      const author = req.query.a as string | undefined;
      const onlyfav = req.query.f as string | undefined;

      const recipes = await getRecipes({
        page,
        query,
        author,
        favUserId: onlyfav === 'true' ? req.user?.id : undefined,
      });

      
      // Transform to match frontend expectations
      const transformedRecipes = recipes.map(recipe => ({
        id: recipe.id,
        title: recipe.title,
        description: recipe.description,
        owner: recipe.author.login,
        likes: recipe._count.usersLiked,
        likedByMe: req.user ? recipe.usersLiked.find(users => users.userId === req.user.id) : undefined,
      }));

      res.json(transformedRecipes);
    } catch (error) {
      next(error);
    }
});

const transformRecipe = async (req: Request, recipe: NonNullable<Awaited<ReturnType<typeof findRecipe>>>) => {
  const user = await findUserById(recipe.authorId);
  const relatedSteps = await findRelatedStepsWithRels(recipe.id);
  const relations = extractRelationsFromSteps(relatedSteps);

  // Transform steps to the expected format
  const steps = relatedSteps.map(step => ({
    id: step.id,
    title: step.title,
    instruction: step.instruction,
    extension: step.extension ? {
      body: step.extension.body,
      duration: step.extension.duration
    } : undefined
  }));

  const body = {
    id: recipe.id,
    title: recipe.title,
    description: recipe.description,
    owner: user?.login,
    rootStepId: recipe.rootStepId,
    steps: steps.reduce((acc, step) => {
      acc[step.id] = step;
      return acc;
    }, {} as any),
    relations: relations.reduce((acc, relation) => {
      acc[`${relation.parentId}-${relation.childId}`] = relation;
      return acc;
    }, {} as any),
    likes: recipe._count.usersLiked,
    likedByMe: req.user ? recipe.usersLiked.some(users => users.userId === req.user.id) : undefined,
  }
  

  return body;
}

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const recipe = await findRecipe(req.params.id);
    if (!recipe) {
      res.status(404).json({ error: 'Recipe not found' });
      return;
    }
    
    res.status(200).json(await transformRecipe(req, recipe));
  } catch (error) {
    next(error);
  }
});

// Create / Edit / Delete methods are forbidden for unathorized users!
router.use(authMiddleware);

router.post(
  '/', 
  recipeCreateValidator(), 
  handleValidationErrors, 
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Get user ID from auth middleware
      const authorId = req.user.id;
      
      const recipe = await createRecipe({
        ...req.body,
        authorId
      });
      
      res.status(201).json(await transformRecipe(req, recipe));
    } catch (error) {
      next(error);
    }
});

router.patch(
  '/:id', 
  recipeUpdateValidator(), 
  handleValidationErrors, 
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id;

      const recipe = await updateRecipe(id, req.body);
      
      if (recipe === null) {
        res.status(404).json({ error: 'Recipe not found' });
        return;
      }

      res.status(200).json(await transformRecipe(req, recipe));
    } catch (err) {
      next(err);
    }
});

router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  const recipeId = req.params.id;

  const recipe = await findRecipe(recipeId);
  if (recipe?.authorId !== req.user.id) {
    throw new HttpError(401, 'No rights to delete');   
  }

  await deleteRecipe(recipeId);

  res.status(200).json({ success: true });
});

export default router;