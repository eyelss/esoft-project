import { NextFunction, Request, Response } from "express";
import HttpError from "../errors";
import { verifySession } from "../services/session.service";
import { User } from "../../generated/prisma";
import { getCookieOptions } from "../utils/cookie.util";

declare global {
  namespace Express {
    interface Request {
      user: User;
    }
  }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const sessionId = req.cookies.sessionId;
  
  console.log('Auth middleware - checking sessionId:', sessionId);
  console.log('All cookies:', req.cookies);

  if (sessionId === undefined) {
    throw new HttpError(401, 'Session id is missing');
  }

  const result = await verifySession(sessionId)
  
  if (result === null) {
    console.log('Session verification failed for sessionId:', sessionId);
    res.clearCookie('sessionId', getCookieOptions(req));
    throw new HttpError(401, 'Verfication is failed');
  }

  console.log('Session verified successfully for user:', result.user.login);
  req.user = result.user;

  next();
}