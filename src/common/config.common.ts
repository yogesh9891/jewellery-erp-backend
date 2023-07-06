import * as dotenv from "dotenv";
dotenv.config({ override: true });

export const CONFIG = {
  PORT: process.env.PORT ? process.env.PORT : 3000,
  MONGOURI: process.env.MONGOURI ? process.env.MONGOURI : "",
  JWT_ACCESS_TOKEN_SECRET: process.env.JWT_ACCESS_TOKEN_SECRET ? process.env.JWT_ACCESS_TOKEN_SECRET : "qwertyuiop",
  JWT_REFRESH_ACCESS_TOKEN_SECRET: process.env.JWT_REFRESH_ACCESS_TOKEN_SECRET ? process.env.JWT_REFRESH_ACCESS_TOKEN_SECRET : "qwertyuiop",
};
