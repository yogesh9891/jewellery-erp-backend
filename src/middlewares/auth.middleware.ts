import { NextFunction, Request, RequestHandler, Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model";
import { CONFIG } from "../common/config.common";

export const authorizeJwt: RequestHandler = async (req, res, next) => {
  // console.log(req.headers);

  const authorization = req.headers["authorization"];
  let token = authorization && authorization.split("Bearer ")[1];
  if (!token && typeof req.query.token == "string") {
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({ message: "Invalid Token" });
  }

  try {
    const decoded: any = jwt.verify(token, CONFIG.JWT_ACCESS_TOKEN_SECRET);
    next();
  } catch (e) {
    console.error(e);
    res.status(401).json({ message: "Token is not valid" });
  }
};

export const  verifyRefreshTokenJwt =  (email:string,token:string) => {
  // console.log(req.headers);
  if (!token) {
    return "";
  }
  try {
    const decoded: any = jwt.verify(token, CONFIG.JWT_REFRESH_ACCESS_TOKEN_SECRET);
    console.log(decoded,"decodeddecodeddecodeddecodeddecoded")
    return decoded?.user?.email === email;
  } catch (e) {
    console.error(e);
    return "";
  }
};
export const setUserAndUserObj: RequestHandler = async (req, res, next) => {
  // console.log(req.headers);

  const authorization = req.headers["authorization"];
  let token = authorization && authorization.split("Bearer ")[1];
  if (!token && typeof req.query.token == "string") {
    token = req.query.token;
  }
  if (token) {
    try {
      // Verify token
      const decoded: any = jwt.verify(token, CONFIG.JWT_ACCESS_TOKEN_SECRET);
      
      // Add user from payload
      if (decoded) {
        req.user = decoded;
      }

      if (req.user) {
        req.user.userObj = await User.findById(decoded.userId).exec();
      }
    } catch (e) {
      console.error(e);
      // return res.status(401).json({ message: "Invalid Token" });
    }
  }
  next();
};
