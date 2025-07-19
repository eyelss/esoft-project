import { NextFunction, Request, Response } from "express";
import { verifySession } from "../services/session.service";

export const weakAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const sessionId = req.cookies.sessionId;
  
  if (sessionId === undefined) {
    return next();
  }

  const result = await verifySession(sessionId)
  
  if (result === null) {
    res.clearCookie('sessionId');
    return next();
  }

  req.user = result.user;

  next();
}