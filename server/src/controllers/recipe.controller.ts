import { Router } from "express";
import NotImplementedError from "../errors/not.impl.error";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.get('/', async (req, res, next) => {
    res.json([]).status(200);
});

router.get('/:id', async (req, res, next) => {
    throw new NotImplementedError();
});

// Create / Edit / Delete methods are forbidden for unathorized users!
router.use(authMiddleware);

router.post('/', async (req, res, next) => {
    throw new NotImplementedError();
});

router.patch('/:id', async (req, res, next) => {
    throw new NotImplementedError();
});

router.delete('/:id', async (req, res, next) => {
    throw new NotImplementedError();
});

export default router;