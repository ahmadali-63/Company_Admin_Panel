import mongoose from "mongoose";
import { LeaveModel } from "./server/src/modules/leave/leave.model.js";

async function test() {
  await mongoose.connect("mongodb://localhost:27017/company_admin_panel");
  const leaves = await LeaveModel.find({});
  console.log(leaves.map(l => ({ id: l._id, status: l.status, comment: l.reviewComment })));
  mongoose.disconnect();
}
test().catch(console.error);
