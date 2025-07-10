import { NextFunction, Request, RequestHandler, Response } from "express";
import HttpError from "../errors";
import { verifySession } from "../services/session.service";
import { User } from "../../generated/prisma";

declare global {
  namespace Express {
    interface Request {
      user: User;
    }
  }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const sessionId = req.cookies.sessionId;
  
  if (sessionId === undefined) {
    throw new HttpError(401, 'Session id is missing');
  }

  const result = await verifySession(sessionId)
  
  if (result === null) {
    res.clearCookie('sessionId');
    throw new HttpError(401, 'Verfication is failed');
  }

  req.user = result.user;

  next();
}