import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  id: string;
  name: string;
  email: string;
  password: string;
  avatar?: string;
}

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
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.virtual('id').get(function () {
  return this._id.toString();
});

userSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret:any) => {
    delete ret._id;
    delete ret.__v;
  },
});

export const User = mongoose.model<IUser>('User', userSchema);
