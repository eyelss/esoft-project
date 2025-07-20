import { NextFunction, Request, Response, Router } from "express";
import { verifyUser } from "../services/user.service";
import * as validator from "express-validator";
import * as userService from "../services/user.service";
import { authMiddleware } from "../middlewares/auth.middleware";
import HttpError from "../errors";
import { signinValidator, signupValidator } from "../utils/validators";
import { createSession, destroySession, getExpireDate } from "../services/session.service";
import HttpValidationError from "../errors/validation.error";
import { getCookieOptions } from "../utils/cookie.util";

const router = Router();

router.post('/register', 
  // loginValidator(),
  // passwordValidator(),
  signupValidator(),
  async (req: Request, res: Response, next: NextFunction) => {
    const result = validator.validationResult(req);

    if (!result.isEmpty()) {
      throw new HttpValidationError(result.array());
    }
    
    const { login, password } = req.body;

    const existed = await userService.findUserByLogin(login);

    if (existed !== null) {
      throw new HttpError(409, 'Login already exists');
    }

    const user = await userService.createUser({ login, password });
    res.status(201).json(user);
});

router.post('/login',
  signinValidator(),
  // loginValidator(),
  // passwordValidator(),
  (req: Request, res: Response, next: NextFunction) => {
    
    const result = validator.validationResult(req);

    if (!result.isEmpty()) {
      throw new HttpValidationError(result.array());
    }

    const { login, password } = req.body;

    verifyUser(login, password)
      .then(user => {
        console.log('Login successful for user:', user.login);
        return createSession(user);
      })
      .then(session => {
        const cookieOptions = {
          ...getCookieOptions(req),
          expires: getExpireDate(),
        };
        
        console.log('Setting sessionId cookie:', session.id);
        console.log('Cookie options:', cookieOptions);
        
        res.cookie('test-sessionId', session.id, cookieOptions);
        res.json({ status: 'success' });
      })
      .catch(err => {
        console.log(err);
        if (err instanceof HttpError) {
          return next(err);
        }
        // verification error
        next(new HttpError(500, (err as Error).message));
      });
});

router.post('/verify', 
  authMiddleware,
  (req, res, next) => {
    console.log('Verify successful for user:', req.user.login);
    console.log('Received sessionId cookie:', req.cookies.sessionId);
    res.status(200).json({
      login: req.user.login,
    })
});

router.post('/logout', 
  authMiddleware, 
  (req, res, next) => {
    const sessionId = req.cookies.sessionId;

    if (sessionId === undefined) {
      throw new HttpError(401, 'Session id is missing');
    }

    destroySession(sessionId).then(result => {
      res.clearCookie('sessionId', getCookieOptions(req))
      res.sendStatus(200);
    }).catch(err => {
      if (err instanceof HttpError) {
        throw err
      }
      
      throw new HttpError(500, err.message);
    });
});

router.get('/test-cookie', (req, res) => {
  const testValue = 'test-cookie-value-' + Date.now();
  const cookieOptions = {
    ...getCookieOptions(req),
    expires: new Date(Date.now() + 1000 * 60 * 60), // 1 hour
  };
  
  res.cookie('testCookie', testValue, cookieOptions);
  res.json({ 
    message: 'Test cookie set', 
    value: testValue,
    cookieOptions,
    receivedCookies: req.cookies
  });
});

export default router;