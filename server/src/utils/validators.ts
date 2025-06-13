import * as validator from "express-validator";

export const passwordValidator = () => validator
  .body('password')
  .isString().withMessage('Password has to be string')
  .trim()
  .isStrongPassword({
    minSymbols: 0,
  }).withMessage('Weak password');

export const loginValidator = () => validator
  .body('login')
  .isString().withMessage('Login has to be string')
  .trim()
  .isLength({ 
    min: 6,
    max: 16, 
  }).withMessage('Login has to be between 6 and 16');