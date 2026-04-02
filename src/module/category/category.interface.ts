// category.interface.ts
import mongoose, { Document } from "mongoose";

export interface ICategory {
  company_id : mongoose.Types.ObjectId;
  name       : string;
  slug       : string;
  parent_id  : mongoose.Types.ObjectId | null;  // null = root
  path       : string;   // "grandparentId,parentId,selfId"
  depth      : number;   // 0 = root, 1 = child, 2 = grandchild
  image      : string | null;
  is_active  : boolean;
  createdBy  : mongoose.Types.ObjectId;
  createdAt  : Date;
  updatedAt  : Date;
}

export interface ICategoryDocument extends ICategory, Document {}