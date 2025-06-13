import dotenv from "dotenv";
dotenv.config();

import app from "./app";

declare module "express-session" {
  interface SessionData {
    user: string;
  }
}

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Listening port: ${PORT}`);
});
