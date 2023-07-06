import { NextFunction, Request, Response } from "express";
import { Types } from "mongoose";
import { APPROVED_STATUS } from "../helpers/constant";
import { storeFileAndReturnNameBase64 } from "../helpers/fileSystem";
import { Product } from "../models/product.model";
// import { Product } from "../models/product.model";
import { string_to_slug } from "./../helpers/stringify"
import { Category } from "../models/category.model";
export const addProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(req.body);
    const ProductNameCheck = await Product.findOne({
      name: new RegExp(`^${req.body.name}$`, "i"),
    }).exec();
    let obj = {};
    if (ProductNameCheck) throw new Error("Product Already exist please change brand name or url");
    if (req.body.productImage) {
      req.body.productImage = await storeFileAndReturnNameBase64(req.body.productImage);
    }
    if (req.body.purityImage) {
        req.body.purityImage = await storeFileAndReturnNameBase64(req.body.purityImage);
      }
  console.log(req.body,"sdfsdfhasdfsfsdfadsfsdfsdfsd")
    const newEntry = new Product(req.body).save();
    res.status(200).json({ message: "Product Successfully Created", success: true });
  } catch (err) {
    next(err);
  }
};
export const getProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let query: any = {}

   
    let isPaginate= true;
    if (req.query.q) {
      query = { ...query, name: new RegExp(`${req.query.q}`, 'i') }
    }
    if(req.query.paginate){
      isPaginate = req.query.paginate=='true' ? true: false
    }
   
    let page = req.query.page ? parseInt(`${req.query.page}`) : 1;
    let perPage = req.query.perPage ? parseInt(`${req.query.perPage}`) : 10;
    const startIndex = (page - 1) * perPage;


    let productArr: any = [];
    if(isPaginate){
      productArr = await Product.find(query).skip(startIndex).limit(perPage).lean().exec();
    } else {
      productArr = await Product.find(query).lean().exec();
    }

    // if (req.query.level) {
    // } else {
    // productArr = await Product.find().skip((pageValue - 1) * limitValue).limit(limitValue).lean().exec();
    // }

    for (const el of productArr) {
      // console.log(el);
      if (el.categoryId) {
        const categoryObj = await Category.findById(el.categoryId).lean().exec();
        if (categoryObj) {
          el.categoryObj = categoryObj;
          el.categoryName = categoryObj?.name;
        }
      }
     

        // let productArr = await Product.find(pquery).limit(4).exec()
        // el.productArr = productArr;
      }



      const totalCount = await Product.find(query).countDocuments();
      const totalPages = Math.ceil(totalCount / perPage);

    res.status(200).json({ message: "getProduct", data: productArr,totalCount,totalPages, perPage,success: true });
  } catch (err) {
    next(err);
  }
};

export const getChildProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let productArr: any = [];
    if (req.query.level) {
      productArr = await Product.find({ level: `${req.query.level}` })
        .lean()
        .exec();
    } else {
      productArr = await Product.find({ level: 1 }).lean().exec();
    }
    for (const el of productArr) {
      console.log(el);
      if (el.parentProductId) {
        const parentObj = await Product.findById(el.parentProductId).lean().exec();
        if (parentObj) {
          el.parentProductName = parentObj.name;
        }
      }
    }
    res.status(200).json({ message: "getProduct", data: productArr, success: true });
  } catch (err) {
    next(err);
  }
};

export const updateById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let obj = {};
    if (req.body.productImage && `${req.body.productImage}`.includes("base64")) {
        req.body.productImage = await storeFileAndReturnNameBase64(req.body.productImage);
      }
      if (req.body.purityImage && `${req.body.purityImage}`.includes("base64")) {
          req.body.purityImage = await storeFileAndReturnNameBase64(req.body.purityImage);
        }
  
    await Product.findByIdAndUpdate(req.params.id, req.body).exec();

    res.status(200).json({ message: "product Updated", success: true });
  } catch (err) {
    next(err);
  }
};
export const deleteById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const productObj = await Product.findByIdAndDelete(req.params.id).exec();
    if (!productObj) throw { status: 400, message: "product Not Found" };
    res.status(200).json({ message: "product Deleted", success: true });
  } catch (err) {
    next(err);
  }
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const productObj:any = await Product.findById(req.params.id).lean().exec();
    const categoryObj = await Category.findById(productObj.categoryId).lean().exec();
    if (categoryObj) {
        productObj.categoryObj = categoryObj;
    }
    if (!productObj) throw { status: 400, message: "product Not Found" };

    res.status(200).json({ message: "product Found", data: productObj, success: true });
  } catch (err) {
    next(err);
  }
};


export const getNameBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const productObj = await Product.findOne({ slug: req.params.id }).exec();
    if (!productObj) throw { status: 400, message: "product Not Found" };

    res.status(200).json({ message: "product Found", data: productObj, success: true });
  } catch (err) {
    next(err);
  }
};

