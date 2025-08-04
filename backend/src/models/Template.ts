import mongoose, { Schema, Document } from 'mongoose';
import { DesignElementType, DesignTemplateCategory, DesignElement, DesignPage, DesignTemplate } from '@shared/types';

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
  isPublic: boolean;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ElementSchema = new Schema<DesignElement>({
  type: { type: String, enum: ['text', 'image', 'shape', 'video'], required: true },
  placeholder: String,
  position: {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
  },
  size: {
    width: { type: Number, required: true },
    height: { type: Number, required: true },
  }
});

const PageSchema = new Schema<DesignPage>({
  canvas: {
    elements: { type: [ElementSchema], default: [] },
  }
});

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
    isPublic: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.model<TemplateDocument>('Template', TemplateSchema);
