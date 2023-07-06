import mongoose, { model, Schema, Types } from "mongoose";

export interface IProduct {
  tagNo:string,
  name:string,
  productType:string,
  categoryId:string,
  price:{
    type:string,
    value:string
  },
  labourRate:{
    type:string,
    value:string
  },
  categoryIdArr: [
    {
      categoryId: string,
    }],
  boxType:string,
  grossWeight:string,
  netWeight:string,
  productImage:string,
  purityImage:string,
  status: Boolean;
  createdAt: Date;
  updateAt: Date;
}

const product = new Schema<IProduct>(
  {
    tagNo: String,
    name: String,
    productType: String,
    categoryId:String,
    price:{
        type:{ type: String, default: "item" },
        value:String
      },
      categoryIdArr: [
      {
        categoryId: String,
      },
    ],
    labourRate:{
        type:{ type: String, default: "item" },
        value:String
      },
      boxType:String,
      grossWeight:String,
      netWeight:String,
      productImage: { type: String, default: "" },
      purityImage: { type: String, default: "" },
    status: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Product = model<IProduct>("product", product);
