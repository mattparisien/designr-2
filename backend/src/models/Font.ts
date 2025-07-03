import mongoose, { Document, Schema } from 'mongoose';

export interface IFont extends Document {
  name: string;
  originalName: string;
  fontFamily: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  userId: mongoose.Types.ObjectId;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FontSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  originalName: {
    type: String,
    required: true,
  },
  fontFamily: {
    type: String,
    required: true,
    trim: true,
  },
  fileUrl: {
    type: String,
    required: true,
  },
  fileSize: {
    type: Number,
    required: true,
  },
  mimeType: {
    type: String,
    required: true,
    enum: ['font/woff', 'font/woff2', 'font/ttf', 'font/otf', 'application/font-woff', 'application/font-woff2', 'application/x-font-ttf', 'application/x-font-otf'],
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  isPublic: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Index for efficient queries
FontSchema.index({ userId: 1, createdAt: -1 });
FontSchema.index({ isPublic: 1 });

export default mongoose.model<IFont>('Font', FontSchema);
