import { Router } from "express";
import { verifyUser } from "../services/user.service";
import * as validator from "express-validator";
import * as userService from "../services/user.service";
import { authMiddleware } from "../middlewares/auth.middleware";
import HttpError from "../errors";
import { loginValidator, passwordValidator } from "../utils/validators";
import { createSession, destroySession } from "../services/session.service";
import HttpValidationError from "../errors/validation.error";

const router = Router();

router.get('/check', authMiddleware, (req, res) => {
  res.status(200).send(req.user);
});

router.post('/register', 
  loginValidator(),
  passwordValidator(),
  async (req, res, next) => {
    const result = validator.validationResult(req);

    if (!result.isEmpty()) {
      throw new HttpValidationError(result.array());
    }
    
    const { login, password } = req.body;

    const user = await userService.createUser({ login, password });
    res.status(201).json(user);
});

router.post('/login',
  loginValidator(),
  passwordValidator(),
  (req, res, next) => {
    
    const result = validator.validationResult(req);

    if (!result.isEmpty()) {
      throw new HttpValidationError(result.array());
    }

    const { login, password } = req.body;

    verifyUser(login, password).then(user => {
      // verification success
      createSession(user).then(session => {
        res.cookie('sessionId', session.id);
        res.status(200).json({ success: true });
      });
    }).catch((err: Error) => {
      if (err instanceof HttpError) {
        throw err;
      }
      // verification error
      throw new HttpError(500, err.message);
    });
});

router.post('/verify', 
  authMiddleware,
  (req, res, next) => {
    res.status(200).json({
      login: req.user.login,
    })
});

router.post('/logout', 
  authMiddleware, 
  (req, res, next) => {
    console.log('Logout')
    const sessionId = req.cookies.sessionId;

    if (sessionId === undefined) {
      throw new HttpError(401, 'Session id is missing');
    }

    destroySession(sessionId).then(result => {
      res.clearCookie('sessionId')
      res.sendStatus(200);
    }).catch(err => {
      throw new HttpError(500, 'Session destruction is failed');
    });
});

export default router;