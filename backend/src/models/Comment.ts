import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IComment extends Document {
  id: string;
  postId: Types.ObjectId;
  userId: Types.ObjectId;
  content: string;
  isAnonymous: boolean;
  createdAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    postId: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

commentSchema.virtual('id').get(function () {
  return this._id.toString();
});

commentSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret:any) => {
    delete ret._id;
    delete ret.__v;
  },
});

export const Comment = mongoose.model<IComment>('Comment', commentSchema);
