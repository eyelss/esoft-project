import { ValidationError } from "express-validator";
import HttpError from ".";

class HttpValidationError extends HttpError {
  constructor(
    body: ValidationError[],
  ) {
    super(400, 'Validation error', body.map(err => err.msg));
    Error.captureStackTrace(this, this.constructor);
  }
}

export default HttpValidationError;