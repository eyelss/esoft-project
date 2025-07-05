import { ValidationError } from "express-validator";
import HttpError from ".";

class NotImplementedError extends HttpError {
  constructor() {
    super(500, 'Not implemented code');
    Error.captureStackTrace(this, this.constructor);
  }
}

export default NotImplementedError;