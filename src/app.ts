import createError from "http-errors";
import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import cors from "cors";

import indexRouter from "./routes/index.routes";
import usersRouter from "./routes/users.routes";
import categoryRouter from "./routes/category.routes";
import productRouter from "./routes/product.routes.";

import { errorHandler } from "./middlewares/errorHandler.middleware";
import { CONFIG } from "./common/config.common";
import mongoose from "mongoose";
import { seedData } from "./seeder/seeder";

mongoose.connect(CONFIG.MONGOURI, (err) => {
  if (err) {
    console.log(err);
    return;
  }
  seedData();
  console.log("connected to db at " + CONFIG.MONGOURI);
});

const app = express();
app.use(cors());
app.use(logger("dev"));
app.use(express.json({limit: '25mb'}));
app.use(express.urlencoded({limit: '25mb', extended: true}));
app.use(cookieParser());

app.use(express.static(path.join(process.cwd(), "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/category", categoryRouter);
app.use("/product", productRouter);


app.use(function (req, res, next) {
  next(createError(404));
});

app.use(errorHandler);

export default app;
