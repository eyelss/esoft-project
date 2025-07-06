import { Router, Request, Response, NextFunction } from "express";
import NotImplementedError from "../errors/not.impl.error";
import { authMiddleware } from "../middlewares/auth.middleware";
import { handleValidationErrors } from "../middlewares/validation.middleware";
import { recipeCreateValidator } from "../utils/validators";
import { createRecipe, getRecipes, findRecipe, findRelatedStepsWithRels, extractRelationsFromSteps, deleteRecipe } from "../services/recipe.service";
import { findUserById } from "../services/user.service";
import HttpError from "../errors";

const router = Router();

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const recipes = await getRecipes({
            limit: parseInt(req.query.limit as string) || 20,
            offset: parseInt(req.query.offset as string) || 0
        });
        
        // Transform to match frontend expectations
        const transformedRecipes = recipes.map(recipe => ({
            id: recipe.id,
            title: recipe.title,
            description: recipe.description,
            owner: recipe.author?.login || 'Unknown',
        }));
        
        res.json(transformedRecipes);
    } catch (error) {
        next(error);
    }
});

// id: string;
// title: string;
// description: string;
// owner: string;

// status: ChangeStatus;
// currentStepId: string;
// rootStepId: string;

// steps: { [id: string]: Step };
// relations: { [id: string]: Relation };

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const recipe = await findRecipe(req.params.id);
        if (!recipe) {
            res.status(404).json({ error: 'Recipe not found' });
            return;
        }

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

        res.json({
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
            }, {} as any)
        });
    } catch (error) {
        next(error);
    }
});

// Create / Edit / Delete methods are forbidden for unathorized users!
router.use(authMiddleware);

router.post('/', recipeCreateValidator(), handleValidationErrors, async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Get user ID from auth middleware
        const authorId = req.user.id;
        
        const recipe = await createRecipe({
            ...req.body,
            authorId
        });
        
        res.status(201).json(recipe);
    } catch (error) {
        next(error);
    }
});

router.patch('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authorId = req.user.id;


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