import { DesignElementType, DesignPage, DesignTemplate, DesignTemplateCategory } from '@shared/types';
import mongoose, { Document, Schema } from 'mongoose';
import { PageSchema } from 'src/schemas';

export type ElementType = DesignElementType;
export type BackgroundType = 'color' | 'image' | 'gradient';
export type TemplateCategory = DesignTemplateCategory;


export interface TemplateDocument extends Document, Omit<DesignTemplate, "id" | "createdAt" | "updatedAt" | "createdBy"> {
  title: string;
  description?: string;
  category: TemplateCategory;
  tags: string[]
  thumbnailUrl?: string;
  pages: DesignPage[];
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TemplateSchema = new Schema<TemplateDocument>(
  {
    title: { type: String, required: true },
    description: String,
    category: {
      type: String,
      enum: ['presentation', 'social', 'print', 'custom'],
      required: true,
    },
    tags: { type: [String], default: [], required: true },
    thumbnailUrl: String,
    pages: { type: [PageSchema], default: [] },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: false },
  },
  { timestamps: true }
);

export default mongoose.model<TemplateDocument>('Template', TemplateSchema);
