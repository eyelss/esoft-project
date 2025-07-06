import express from "express";
import cookieParser from "cookie-parser";
import authController from "./controllers/auth.controller";
import usersController from "./controllers/user.controller";
import recipesController from "./controllers/recipe.controller";
import { errorHandler } from "./middlewares/error.handler";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authController);
app.use('/api/users', usersController);
app.use('/api/recipes', recipesController);

// 404 handling
app.use((req, res) => {
  res.sendStatus(404);
});

app.use(errorHandler);

export default app;