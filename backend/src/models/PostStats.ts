import mongoose, { Schema, Document, Types } from "mongoose";

export interface IPostStats extends Document {
  id: string;
  postId: Types.ObjectId;
  views: number;
  likes: number;
  comments: number;
  score: number;
  likedBy: Types.ObjectId[];
}

const postStatsSchema = new Schema<IPostStats>(
  {
    postId: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
      unique: true,
      index: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
    comments: {
      type: Number,
      default: 0,
    },
    score: {
      type: Number,
      default: 0,
      index: true,
    },
    likedBy: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],
  },
  {},
);

postStatsSchema.virtual("id").get(function () {
  return this._id.toString();
});

postStatsSchema.set("toJSON", {
  virtuals: true,
  transform: (doc, ret: any) => {
    delete ret._id;
    delete ret.__v;
  },
});

export const PostStats = mongoose.model<IPostStats>(
  "PostStats",
  postStatsSchema,
);
