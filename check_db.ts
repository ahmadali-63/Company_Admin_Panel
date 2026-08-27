import mongoose from "mongoose";
import { UserModel } from "./server/src/modules/user/user.model.js";

async function check() {
  await mongoose.connect("mongodb://localhost:27017/company_admin_panel"); // Assuming local mongo
  const aalaf = await UserModel.findOne({ name: /Aalaf/i });
  const neha = await UserModel.findOne({ name: /Neha/i });
  console.log("Aalaf:", aalaf?.teamLeadId);
  console.log("Neha:", neha?._id);
  mongoose.disconnect();
}

check().catch(console.error);
