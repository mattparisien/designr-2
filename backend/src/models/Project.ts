import mongoose, { Schema, Document } from 'mongoose';

export type ElementType = 'text' | 'image' | 'video';

export interface ElementContent {
  placeholder: string;
  type: ElementType;
  value: string;
}

export interface PageContent {
  templatePageIndex: number;
  elements: ElementContent[];
}

export interface ProjectDocument extends Document {
  title: string;
  description?: string;
  templateId: mongoose.Types.ObjectId;
  ownerId?: mongoose.Types.ObjectId;
  pages: PageContent[];
  createdAt: Date;
  updatedAt: Date;
}

const ElementContentSchema = new Schema<ElementContent>({
  placeholder: { type: String, required: true },
  type: { type: String, enum: ['text', 'image', 'video'], required: true },
  value: { type: String, required: true },
});

const PageContentSchema = new Schema<PageContent>({
  templatePageIndex: { type: Number, required: true },
  elements: { type: [ElementContentSchema], default: [] },
});

const ProjectSchema = new Schema<ProjectDocument>(
  {
    title: { type: String, required: true },
    description: String,
    templateId: { type: Schema.Types.ObjectId, ref: 'Template', required: true },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User' },
    pages: { type: [PageContentSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model<ProjectDocument>('Project', ProjectSchema);
