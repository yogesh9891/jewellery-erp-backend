import { Schema, model } from "mongoose";
import { ROLES, ROLES_TYPE } from "../helpers/constant";

// 1. Create an interface representing a document in MongoDB.
export interface IUser {
  name: string;
  email: string;
  phone: string;
  password: string;
  roleType: string;
  role:string,
  joiningDate: string;
  salary: string;
  adhaarNo: string;
  gstNo: string;
  address: string;
  contactName: string;
  taxId: string;
  notes: string;
  documents: [
    {
      fileName: string;
    }
  ];
  approved: boolean;
  accessObj: {
    manageUsers: boolean;
    manageCategory: boolean;
  };
  createdAt: Date;
  updateAt: Date;
}

// 2. Create a Schema corresponding to the document interface.
const usersSchema = new Schema<IUser>(
  {
    name: String,
    email: String,
    phone: String,
    password: String,
    salary: String,
    adhaarNo: String,
    joiningDate: String,
    gstNo: String,
    address: String,
    contactName: String,
    taxId: String,
    notes: String,
    roleType:{
      type: String,
      default: ROLES_TYPE.CUSTOMER,
    },
    role: {
      type: String,
      default: ROLES.USER,
    },
    approved: {
      type: Boolean,
      default: false,
    },
    accessObj: {
      manageUsers: {
        type: Boolean,
        default: false,
      },
      manageCategory: {
        type: Boolean,
        default: false,
      },
    },
    documents: [
      {
        fileName: String,
      },
    ],
    // And `Schema.Types.ObjectId` in the schema definition.
  },
  { timestamps: true }
);

export const User = model<IUser>("Users", usersSchema);
