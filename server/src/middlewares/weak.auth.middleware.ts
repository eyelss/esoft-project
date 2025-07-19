import { NextFunction, Request, Response } from "express";
import { verifySession } from "../services/session.service";

// declare global {
//   namespace Express {
//     interface Request {
//       user: User;
//     }
//   }
// }

export const weakAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const sessionId = req.cookies.sessionId;
  
  if (sessionId === undefined) {
    // throw new HttpError(401, 'Session id is missing');
    return next();
  }

  const result = await verifySession(sessionId)
  
  if (result === null) {
    res.clearCookie('sessionId');
    return next();
    // throw new HttpError(401, 'Verfication is failed');
  }

  req.user = result.user;

  next();
}