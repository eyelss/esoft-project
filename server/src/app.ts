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

const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL || 'https://your-frontend-domain.up.railway.app']
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true, // This is crucial for cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
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