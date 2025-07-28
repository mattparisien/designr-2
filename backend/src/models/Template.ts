import mongoose, { Schema, Document } from 'mongoose';

/* ── 1. Enums for controlled values ─────────────────────────────── */
export enum ElementType {
  TEXT = 'text',
  IMAGE = 'image',
  SHAPE = 'shape',
  VIDEO = 'video',
}

export enum BackgroundType {
  COLOR = 'color',
  IMAGE = 'image',
  GRADIENT = 'gradient',
}

export enum TemplateCategory {
  PRESENTATION = 'presentation',
  SOCIAL = 'social',
  PRINT = 'print',
  CUSTOM = 'custom',
}

/* ── 2. Interfaces ─────────────────────────────────────────────── */
export interface IElement {
  type: ElementType;
  placeholder?: string; // e.g., "titleText"
  position: { x: number; y: number };
  size: { width: number; height: number };
  style?: {
    fontFamily?: string;
    fontSize?: number;
    color?: string;
    [key: string]: any;
  };
}

export interface IPage {
  name: string;
  background?: {
    type: BackgroundType;
    value?: string; // hex code, image URL, gradient definition
  };
  elements: IElement[];
}

export interface ITemplate extends Document {
  title: string;
  description?: string;
  category: TemplateCategory;
  thumbnailUrl?: string;
  canvasSize: { width: number; height: number };
  pages: IPage[];
  isPublic: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

/* ── 3. Schemas ────────────────────────────────────────────────── */
const ElementSchema = new Schema<IElement>({
  type: { type: String, enum: Object.values(ElementType), required: true },
  placeholder: { type: String },
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

const PageSchema = new Schema<IPage>({
  name: { type: String, required: true },
  background: {
    type: { type: String, enum: Object.values(BackgroundType) },
    value: { type: String },
  },
  elements: { type: [ElementSchema], default: [] },
});

const TemplateSchema = new Schema<ITemplate>(
  {
    title: { type: String, required: true },
    description: { type: String },
    category: {
      type: String,
      enum: Object.values(TemplateCategory),
      required: true,
    },
    thumbnailUrl: { type: String },
    canvasSize: {
      width: { type: Number, required: true },
      height: { type: Number, required: true },
    },
    pages: { type: [PageSchema], default: [] },
    isPublic: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

/* ── 4. Export Model ────────────────────────────────────────────── */
export default mongoose.model<ITemplate>('Template', TemplateSchema);
