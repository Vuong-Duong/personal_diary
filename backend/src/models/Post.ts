import mongoose, { Schema, Document, Types } from 'mongoose';

export type PostVisibility = 'PRIVATE' | 'PUBLIC';
export type PostStatus = 'DRAFT' | 'PUBLISHED';

export interface IPost extends Document {
  id: string;
  userId: Types.ObjectId;
  title: string;
  content: string;
  visibility: PostVisibility;
  isAnonymous: boolean;
  status: PostStatus;
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema<IPost>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
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
      enum: ['PRIVATE', 'PUBLIC'],
      default: 'PUBLIC',
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['DRAFT', 'PUBLISHED'],
      default: 'DRAFT',
    },
  },
  {
    timestamps: true,
  }
);

postSchema.virtual('id').get(function () {
  return this._id.toString();
});

postSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret:any) => {
    delete ret._id;
    delete ret.__v;
  },
});

export const Post = mongoose.model<IPost>('Post', postSchema);
