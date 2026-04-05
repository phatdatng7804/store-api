import "dotenv/config";
import mongoose from "mongoose";
import ProductVariant from "./src/models/productVariant.model.js";
await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/storedb");
const count = await ProductVariant.countDocuments();
console.log("ProductVariant count:", count);
const variants = await ProductVariant.find().populate("product").populate("color").populate("size").limit(3);
console.log("Variants:", JSON.stringify(variants, null, 2));
await mongoose.disconnect();
