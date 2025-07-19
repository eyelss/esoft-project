import { NextFunction, Request, Response, Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { addLike, deleteLike } from "../services/recipe.service";

const router = Router();

router.use(authMiddleware);

router.post('/like/:recipeId', async (req: Request, res: Response, next: NextFunction) => {
  const recipeId = req.params.recipeId;
  const userId = req.user.id;

  try {
    await addLike(recipeId, userId);
  
    res.status(200).json({ status: 'success' });
  } catch (err) {
    next(err);
  }
});

router.post('/removelike/:recipeId', async (req, res, next) => {
  const recipeId = req.params.recipeId;
  const userId = req.user.id;

  try {
    await deleteLike(recipeId, userId);
  
    res.status(200).json({ status: 'success' });
  } catch (err) {
    next(err);
  }
});

export default router;