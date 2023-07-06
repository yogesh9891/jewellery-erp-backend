import { NextFunction, Request, Response } from "express";
import { comparePassword, encryptPassword } from "../helpers/bcrypt";
import { generateAccessJwt ,generateRefreshJwt } from "../helpers/jwt";
import { User } from "../models/user.model";
import { ROLES } from "../common/constant.common";
import { verifyRefreshTokenJwt } from "../middlewares/auth.middleware";

export const webLogin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(req.body,"req.bodyreq.bodyreq.body")
    const UserExistCheck = await User.findOne({ $or: [{ email: new RegExp(`^${req.body.email}$`) }] }).exec();
    if (!UserExistCheck) {
      throw new Error(`User Does Not Exist`);
    }

    if (!UserExistCheck.approved) {
      throw new Error(`Please wait while the admins verify your document(s).`);
    }

    const passwordCheck = await comparePassword(UserExistCheck.password, req.body.password);
    if (!passwordCheck) {
      throw new Error(`Invalid Credentials`);
    }

    let user = {
      name: UserExistCheck.name,
      email: UserExistCheck.email,
      phone: UserExistCheck.phone,
      role: UserExistCheck.role,
      _id: UserExistCheck._id,
      accessObj: UserExistCheck.accessObj,
    };
    const token = await generateAccessJwt({
      userId: UserExistCheck._id,
      role: UserExistCheck.role,
      user
    });
    const refreshToken = await generateRefreshJwt({
      userId: UserExistCheck._id,
      role: UserExistCheck.role,
      user
    });

    res.status(200).json({ message: "User Logged In", token ,user,refreshToken});
  } catch (error) {
    next(error);
  }
};

export const appLogin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const UserExistCheck = await User.findOne({ $or: [{ email: new RegExp(`^${req.body.email}$`) }] }).exec();
    if (!UserExistCheck) {
      throw new Error(`User Does Not Exist`);
    }

    if (!UserExistCheck.approved) {
      throw new Error(`Please wait while the admins verify your document(s).`);
    }
    const passwordCheck = await comparePassword(UserExistCheck.password, req.body.password);
    if (!passwordCheck) {
      throw new Error(`Invalid Credentials`);
    }
    const token = await generateAccessJwt({
      userId: UserExistCheck._id,
      role: UserExistCheck.role,
      user: {
        name: UserExistCheck.name,
        email: UserExistCheck.email,
        phone: UserExistCheck.phone,
        _id: UserExistCheck._id,
      },
    });
    res.status(200).json({ message: "User Logged In", token });
  } catch (error) {
    next(error);
  }
};

export const addUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const UserExistEmailCheck = await User.findOne({
      email: new RegExp(`^${req.body.email}$`),
    }).exec();

    if (UserExistEmailCheck) {
      throw new Error(`User with this email Already Exists`);
    }

    const UserExistPhoneCheck = await User.findOne({
      phone: req.body.phone,
    }).exec();
    if (UserExistPhoneCheck) {
      throw new Error(`User with this phone Already Exists`);
    }
    if(req.body.password){
       req.body.password = await encryptPassword(req.body.password);
    }

    const user = await new User({ ...req.body, role: ROLES.USER }).save();

    res.status(201).json({ message: "User Created", data: user._id });
  } catch (error) {
    next(error);
  }
};

export const registerUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const UserExistEmailCheck = await User.findOne({
      email: new RegExp(`^${req.body.email}$`),
    }).exec();

    if (UserExistEmailCheck) {
      throw new Error(`User with this email Already Exists`);
    }

    const UserExistPhoneCheck = await User.findOne({
      phone: req.body.phone,
    }).exec();
    if (UserExistPhoneCheck) {
      throw new Error(`User with this phone Already Exists`);
    }

    req.body.password = await encryptPassword(req.body.password);

    const user = await new User({ ...req.body, role: ROLES.USER }).save();

    res.status(201).json({ message: "Registered", data: user._id });
  } catch (error) {
    next(error);
  }
};

export const deleteUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findByIdAndDelete(req.params.userId).exec();
    res.status(201).json({ message: "User deleted" });
  } catch (error) {
    next(error);
  }
};
export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.params.userId).exec();
    res.status(201).json({ message: "User Found",data:user });
  } catch (error) {
    next(error);
  }
};


export const approveUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.userId, { approved: true }).exec();
    res.status(201).json({ message: "User Approved" });
  } catch (error) {
    next(error);
  }
};

export const uploadDocuments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      throw new Error("Error Uploading File");
    }

    const userObj = await User.findByIdAndUpdate(req.params.userId, {
      $push: { documents: { fileName: req.file?.filename } },
    }).exec();

    if (!userObj) {
      throw new Error(`User does not exist`);
    }

    res.json({ message: "Image Uploaded", data: req.file.filename });
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {

    let query:any ={
      role: { $ne: ROLES.ADMIN },
    };
   if(req.query.roleType){
      query.roleType = req.query.roleType
   }

   let isPaginate = true;
    if(req.query.paginate){
      isPaginate = req.query.paginate ? true: false
    }

    let page = req.query.page ? parseInt(`${req.query.page}`) : 1;
    let perPage = req.query.perPage ? parseInt(`${req.query.perPage}`) : 10;
    const startIndex = (page - 1) * perPage;
    console.log(
      req.query,
      "=====================queryqueryqueryqueryquery_req.query,"
    );


  
    let users = [];
    if(isPaginate) {
      users = await User.find(query ).limit(perPage)
      .skip(startIndex)
      .sort({ createdAt: -1 }).exec();
    }  else {
      users = await User.find(query).sort({ createdAt: -1 }).exec();
    }
    const totalCount = await User.find(query).countDocuments();
    const totalPages = Math.ceil(totalCount / perPage);

    
    res.json({ message: "ALL Users", data: users,  page,
    perPage,
    totalCount,
    totalPages,
    success: true, });
  } catch (error) {
    next(error);
  }
};

export const sendOtp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const UserExistCheck = await User.findOne({ phone: new RegExp(`^${req.body.phone}$`) }).exec();
    if (!UserExistCheck) {
      throw new Error(`User Does Not Exist`);
    }
    res.json({ message: "OTP SENT" });
  } catch (error) {
    next(error);
  }
};

export const verifyOtp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const UserExistCheck = await User.findOne({ phone: new RegExp(`^${req.body.phone}$`) }).exec();
    if (!UserExistCheck) {
      throw new Error(`User Does Not Exist`);
    }

    if (!UserExistCheck.approved) {
      throw new Error(`Please wait while the admins verify your document(s).`);
    }

    const token = await generateAccessJwt({
      userId: UserExistCheck._id,
      role: UserExistCheck.role,
      user: {
        name: UserExistCheck.name,
        email: UserExistCheck.email,
        phone: UserExistCheck.phone,
        _id: UserExistCheck._id,
      },
    });
    res.status(200).json({ message: "User Logged In", token });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({ message: "User Data", data: req.user?.userObj });
  } catch (error) {
    next(error);
  }
};


export const updateById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const UserExistCheck = await User.findById(req.params?.userId).exec()
    if (!UserExistCheck) {
      throw new Error(`User Does Not Found`);
    }
    if (req.body.password) {
      req.body.password = await encryptPassword(req.body.password);
    }
    if (req.body.email) {
      const user = await User.find({ email: new RegExp(`^${req.body.email}$`), _id: { $ne: req.params?.userId } }).exec();
      if (user.length) {
        throw new Error("This email is already being used");
      }

    }
   
    // if (req.body.name) {
    //   obj.name = req.body.name;
    // }

    const user = await User.findByIdAndUpdate(req.params?.userId, req.body, { new: true }).exec();
    console.log(req.body, user);
    if (!user) throw new Error("User Not Found");
    res.json({ message: "User Updated" });
  } catch (error) {
    next(error);
  }
};
export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const obj: any = {};
    if (req.body.name) {
      obj.name = req.body.name;
    }
    if (req.body.password) {
      obj.password = await encryptPassword(req.body.password);
    }
    if (req.body.email) {
      const user = await User.find({ email: new RegExp(`^${req.body.email}$`), _id: { $ne: req.user?.userId } }).exec();
      if (user.length) {
        throw new Error("This email is already being used");
      }

      obj.email = req.body.email;
    }
    if (req.body.address) {
      obj.address = req.body.address;
    }
    // if (req.body.name) {
    //   obj.name = req.body.name;
    // }

    const user = await User.findByIdAndUpdate(req.user?.userId, obj, { new: true }).exec();
    console.log(req.body, user);
    if (!user) throw new Error("User Not Found");
    res.json({ message: "Updated" });
  } catch (error) {
    next(error);
  }
};


export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
      // console.log(req.body);
      const userObj = await User.findOne({ email: new RegExp(`^${req.body.email}$`) })
          .lean()
          .exec();
      if (!userObj) {
          throw { status: 401, message: "user Not Found" };
      }

      if(!verifyRefreshTokenJwt(req.body.email,req.body.refresh)){
        throw { status: 401, message: "Refresh Token is not matched" };
      }
      let accessToken = await generateAccessJwt({
          userId: userObj._id,
          role: ROLES.USER,
          name: userObj.name,
          phone: userObj.phone,
          email: userObj.email,
      });
      let refreshToken = await generateRefreshJwt({
        userId: userObj._id,
        role: ROLES.USER,
        name: userObj.name,
        phone: userObj.phone,
        email: userObj.email,
    });
      res.status(200).json({ message: "Refresh Token", token: accessToken,refreshToken, success: true });

  } catch (err) {
      console.log(err);
      next(err);
  }
};
