import bcrypt from "bcryptjs";
import { Schema, model, type HydratedDocument, type Model, type Types } from "mongoose";

import { ROLES, type Role } from "../../common/constants/roles.js";

export const BCRYPT_ROUNDS = 12;

export interface UserAttrs {
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
  employeeId: string;
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
    employeeId: { type: String, required: true, unique: true, uppercase: true, trim: true },
    joiningDate: { type: Date, required: true, default: () => new Date() },
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

/**
 * Single hashing path. Anything that assigns `user.password = <plaintext>`
 * gets hashing for free; nothing else in the codebase calls bcrypt.hash.
 */
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
userSchema.index({ employeeId: 1 }, { unique: true });
userSchema.index({ name: "text", email: "text" });

export const UserModel = model<UserAttrs, UserModelType>("User", userSchema);
