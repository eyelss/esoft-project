import dotenv from "dotenv";
dotenv.config();

import app from "./app";

const PORT = process.env.PORT || 8080;

console.log(process.env.NODE_ENV);

app.listen(PORT, () => {
  console.log(`Listening port: ${PORT}`);
});
