import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { loginValidator } from "../utils/validators";
import { handleValidationErrors } from "../middlewares/validation.middleware";
import HttpError from "../errors";
import { findUserByLogin, updateUserById } from "../services/user.service";

const router = Router();

router.use(authMiddleware);

router.post('/rename', 
  loginValidator(),
  handleValidationErrors,
  async (req, res, next) => {
    const { newLogin } = req.body;
    const { id, login } = req.user;


    try {
      if (login === newLogin) {
      throw new HttpError(400, 'Old and new logins are the same.');
      }

      const find = await findUserByLogin(newLogin);
      
      if (find !== null) {
      throw new HttpError(400, 'Login already in use.');
      }

      await updateUserById(id, { login: newLogin });
    
      res.status(200).json({ status: 'success' });
    } catch (err) {
      next(err);
    }
});

export default router;