import express from "express";
import {
  addUser,
  appLogin,
  approveUserById,
  deleteUserById,
  getAllUsers,
  getProfile,
  getUserById,
  refreshToken,
  registerUser,
  sendOtp,
  updateById,
  updateProfile,
  uploadDocuments,
  verifyOtp,
  webLogin,
} from "../controllers/user.contoller";
import { authorizeJwt } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/multer.middleware";

const router = express.Router();

// router.post("/login", loginUser);

router.post("/web-login", webLogin);

router.post("/app-login", appLogin);

router.post("/register", registerUser);

router.post("/addUser", authorizeJwt, addUser);

router.get("/getAllUsers", authorizeJwt, getAllUsers);

router.delete("/deleteUserById/:userId", deleteUserById);
router.get("/getUserById/:userId", getUserById);

router.patch("/approveUserById/:userId", approveUserById);

router.post("/upload-documents/:userId", upload.single("file"), uploadDocuments);

router.post("/sendOtp", sendOtp);

router.post("/verifyOtp", verifyOtp);
router.post("/refreshToken",refreshToken);

router.get("/getProfile", authorizeJwt, getProfile);

router.patch("/updateProfile", authorizeJwt, updateProfile);
router.patch("/updateById/:userId", authorizeJwt, updateById);

export default router;
