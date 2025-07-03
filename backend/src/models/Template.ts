import mongoose, { Document, Schema } from 'mongoose';

export interface ITemplate extends Document {
  name: string;
  category: string;
  vibe: 'playful' | 'elegant' | 'bold' | 'minimal' | 'professional';
  width: number;
  height: number;
  thumbnailUrl: string;
  templateData: Record<string, unknown>; // JSON structure for the template
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const templateSchema = new Schema<ITemplate>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    default: 'social-post'
  },
  vibe: {
    type: String,
    enum: ['playful', 'elegant', 'bold', 'minimal', 'professional'],
    required: true
  },
  width: {
    type: Number,
    required: true,
    default: 1080
  },
  height: {
    type: Number,
    required: true,
    default: 1080
  },
  thumbnailUrl: {
    type: String,
    required: true
  },
  templateData: {
    type: Schema.Types.Mixed,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export const Template = mongoose.model<ITemplate>('Template', templateSchema);
