import { NextFunction, Request, Response, Router } from "express";
import { constants } from "http2";
import * as validator from "express-validator";
import * as userService from "../services/user.service";
import argon2 from "argon2";
import { authMiddleware } from "../middlewares/auth.middleware";
import HttpError from "../errors";

const router = Router();

router.get('/', async (req, res, next) => {
  throw new HttpError(500, 'Not implemented');
});

router.get('/:id', async (req, res, next) => {
  throw new HttpError(500, 'Not implemented');
});

router.post('/:id', async (req, res, next) => {
  throw new HttpError(500, 'Not implemented');
});

router.patch('/:id', async (req, res, next) => {
  throw new HttpError(500, 'Not implemented');
});

router.delete('/:id', async (req, res, next) => {
  throw new HttpError(500, 'Not implemented');
});

export default router;