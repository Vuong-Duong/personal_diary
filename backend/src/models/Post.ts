import mongoose, { Schema, Document, Types } from "mongoose";

export type PostVisibility = "PRIVATE" | "PUBLIC";
export type PostStatus = "DRAFT" | "PUBLISHED";

export interface IPost extends Document {
  id: string;
  userId: Types.ObjectId;
  title: string;
  content: string;
  visibility: PostVisibility;
  isAnonymous: boolean;
  status: PostStatus;
  savedBy: Types.ObjectId[];
  deletedAt: Date | null;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema<IPost>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // Index for frequent user filtering
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    visibility: {
      type: String,
      enum: ["PRIVATE", "PUBLIC"],
      default: "PUBLIC",
      index: true, // Index for visibility filtering
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["DRAFT", "PUBLISHED"],
      default: "PUBLISHED",
      index: true, // Index for status filtering
    },
    savedBy: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    deletedAt: {
      type: Date,
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true, // Index for soft delete filtering
    },
  },
  {
    timestamps: true,
  },
);

// Compound indexes for common queries
postSchema.index({ userId: 1, createdAt: -1 }); // User's posts sorted by date
postSchema.index({ status: 1, createdAt: -1 }); // Posts by status sorted by date
postSchema.index({ visibility: 1, status: 1, createdAt: -1 }); // Public posts
postSchema.index({ savedBy: 1 }); // Saved posts by user

postSchema.virtual("id").get(function () {
  return this._id.toString();
});

postSchema.set("toJSON", {
  virtuals: true,
  transform: (doc, ret: any) => {
    delete ret._id;
    delete ret.__v;
  },
});

export const Post = mongoose.model<IPost>("Post", postSchema);
