import express from "express";
import {
  addProduct,
  deleteById,
  getById,
  getProduct,
  getNameBySlug,
  updateById,
} from "../controllers/product.controller";

const router = express.Router();

router.post("/addProduct", addProduct);

router.get("/getAllProducts", getProduct);

router.get("/getProductById/:id", getById);

router.patch("/updateById/:id", updateById);

router.delete("/deleteById/:id", deleteById);


export default router;
