import express from "express";
import { constants } from "http2";

const app = express();

app.use(express.json());

app.use((req, res, next) => {
  // console.log(req.headers.cookie);

  next();
})

app.get("/", (req, res) => {
  console.log('GET');
  console.log(req.body);
  res.status(constants.HTTP_STATUS_OK).json(req.body);
});

app.post("/", (req, res) => {
  console.log('POST');
  console.log(req.body);
  res.status(constants.HTTP_STATUS_CREATED).json({"you":"just posted"});
});

// 404 handling
app.use((req, res) => {
  res.sendStatus(constants.HTTP_STATUS_NOT_FOUND);
})

export default app;