import { NextFunction, Request, Response } from "express";
import { verifySession } from "../services/session.service";
import { getCookieOptions } from "../utils/cookie.util";

export const weakAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const sessionId = req.cookies.sessionId;
  
  if (sessionId === undefined) {
    return next();
  }

  const result = await verifySession(sessionId)
  
  if (result === null) {
    res.clearCookie('sessionId', getCookieOptions(req));
    return next();
  }

  req.user = result.user;

  next();
}