import mongoose, { Document, Schema } from 'mongoose';

export interface IAsset extends Document {
  _id: string;
  name: string;
  originalFilename: string;
  type: 'image' | 'video' | 'audio' | 'document';
  url: string;
  mimeType: string;
  fileSize: number;
  thumbnail?: string;
  cloudinaryPublicId?: string; // For Cloudinary integration
  userId: string;
  tags?: string[];
  folderId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AssetSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  originalFilename: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['image', 'video', 'audio', 'document']
  },
  url: {
    type: String,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  thumbnail: {
    type: String
  },
  cloudinaryPublicId: {
    type: String
  },
  userId: {
    type: String,
    required: true,
    index: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  folderId: {
    type: String
  }
}, {
  timestamps: true // This automatically adds createdAt and updatedAt
});

// Index for efficient queries
AssetSchema.index({ userId: 1, type: 1 });
AssetSchema.index({ userId: 1, folderId: 1 });
AssetSchema.index({ tags: 1 });

export default mongoose.model<IAsset>('Asset', AssetSchema);
