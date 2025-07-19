import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import winston from "winston";
import expressWinston from "express-winston"
import authController from "./controllers/auth.controller";
import recipesController from "./controllers/recipe.controller";
import feedbackController from "./controllers/feedback.controller";
import { errorHandler } from "./middlewares/error.handler";

import "./jobs";

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

  // app.use(expressWinston.logger({
  //   transports: [
  //     new winston.transports.Console()
  //   ],
  //   format: winston.format.combine(
  //     winston.format.colorize(),
  //     winston.format.json(),
  //   ),
  //   meta: true,
  //   expressFormat: true,
  // }));

app.use('/api/auth', authController);
app.use('/api/recipes', recipesController);
app.use('/api/feedback', feedbackController);

// 404 handling
app.use((req, res) => {
  res.sendStatus(404);
});

app.use(errorHandler);

export default app;