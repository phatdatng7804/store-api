import mongoose from "mongoose";
import Role from "../models/role.model.js";

await mongoose.connect("mongodb://127.0.0.1:27017/storedb");

const roles = [
  { code: "ADMIN", name: "admin" },
  { code: "USER", name: "user" },
  { code: "STAFF", name: "staff" }
];

for (const role of roles) {
  await Role.updateOne(
    { name: role.name },
    { $set: role },
    { upsert: true }
  );
}

console.log("Seed roles thành công!");
process.exit();