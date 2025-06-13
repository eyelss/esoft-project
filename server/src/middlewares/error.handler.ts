import { Request, Response, NextFunction, Router } from "express"
import HttpError from "../errors";

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof HttpError) {
    res.status(err.statusCode).json({ message: err.message, body: err.body });
    return;
  }

  res.status(500).send('Unhandled error');
}