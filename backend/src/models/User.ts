import mongoose, { Schema, Document, Model } from "mongoose";
import * as bcrypt from "bcrypt";

/**
 * Interface cho User document
 */
export interface IUser extends Document {
  id: string;
  name: string;
  email: string;
  password: string;
  avatar?: string | null;
  role: "user" | "admin";
  comparePassword(candidatePassword: string): Promise<boolean>;
}

/**
 * User Schema
 */
const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    avatar: {
      type: String,
      default: null,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Hash password trước khi lưu
 */
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

/**
 * So sánh password khi login
 */
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

/**
 * Virtual id
 */
userSchema.virtual("id").get(function () {
  return this._id.toString();
});

/**
 *  ẩn password, _id, __v
 */
userSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret: any) => {
    delete ret._id;
    delete ret.password;
  },
});

/**
 * Export Model
 */
export const User: Model<IUser> = mongoose.model<IUser>(
  "User",
  userSchema
);