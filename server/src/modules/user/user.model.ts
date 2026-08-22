import bcrypt from "bcryptjs";
import { Schema, model, type HydratedDocument, type Model, type Types } from "mongoose";

import { ROLES, type Role } from "../../common/constants/roles.js";

export const BCRYPT_ROUNDS = 10;

export interface UserAttrs {
  employeeId: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  phone: string;
  department: string;
  designation: string;
  hrId: Types.ObjectId | null;
  projectIds: Types.ObjectId[];
  isActive: boolean;
  joiningDate: Date;
  profileImage: string;
  lastLogin: Date | null;
  /** Bumped on logout / password change to invalidate live refresh tokens. */
  tokenVersion: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserMethods {
  comparePassword(candidate: string): Promise<boolean>;
}

export type UserDocument = HydratedDocument<UserAttrs, UserMethods>;

export type UserModelType = Model<UserAttrs, Record<string, never>, UserMethods>;

const userSchema = new Schema<UserAttrs, UserModelType, UserMethods>(
  {
    employeeId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/,
        "Please enter a valid email address",
      ],
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ROLES,
      required: true,
    },
    phone: { type: String, trim: true, default: "" },
    department: { type: String, trim: true, default: "" },
    designation: { type: String, trim: true, default: "" },
    hrId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    projectIds: [{ type: Schema.Types.ObjectId, ref: "Project" }],
    isActive: { type: Boolean, default: true },
    joiningDate: { type: Date, default: Date.now },
    profileImage: { type: String, default: "" },
    lastLogin: { type: Date, default: null },
    tokenVersion: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        delete ret.password;
        delete ret.tokenVersion;
        delete ret.__v;
        return ret;
      },
    },
  },
);

userSchema.pre("save", async function hashPassword() {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, BCRYPT_ROUNDS);
});

userSchema.method(
  "comparePassword",
  function comparePassword(this: UserDocument, candidate: string) {
    return bcrypt.compare(candidate, this.password);
  },
);

userSchema.index({ role: 1 });
userSchema.index({ hrId: 1 });
userSchema.index({ projectIds: 1 });
userSchema.index({ name: "text", email: "text", department: "text", designation: "text" });

export const UserModel = model<UserAttrs, UserModelType>("User", userSchema);
