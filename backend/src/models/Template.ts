import mongoose, { Schema, Document } from 'mongoose';

export type ElementType = 'text' | 'image' | 'shape' | 'video';
export type BackgroundType = 'color' | 'image' | 'gradient';
export type TemplateCategory = 'presentation' | 'social' | 'print' | 'custom';

export interface Element {
  type: ElementType;
  placeholder?: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  style?: {
    fontFamily?: string;
    fontSize?: number;
    color?: string;
    [key: string]: any;
  };
}

export interface Page {
  name: string;
  background?: {
    type: BackgroundType;
    value?: string;
  };
  elements: Element[];
}

export interface TemplateDocument extends Document {
  title: string;
  description?: string;
  category: TemplateCategory;
  tags: string[]
  thumbnailUrl?: string;
  canvasSize: { width: number; height: number };
  pages: Page[];
  isPublic: boolean;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ElementSchema = new Schema<Element>({
  type: { type: String, enum: ['text', 'image', 'shape', 'video'], required: true },
  placeholder: String,
  position: {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
  },
  size: {
    width: { type: Number, required: true },
    height: { type: Number, required: true },
  },
  style: { type: Schema.Types.Mixed },
});

const PageSchema = new Schema<Page>({
  name: { type: String, required: true },
  background: {
    type: { type: String, enum: ['color', 'image', 'gradient'] },
    value: String,
  },
  elements: { type: [ElementSchema], default: [] },
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
    canvasSize: {
      width: { type: Number, required: true },
      height: { type: Number, required: true },
    },
    pages: { type: [PageSchema], default: [] },
    isPublic: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.model<TemplateDocument>('Template', TemplateSchema);
