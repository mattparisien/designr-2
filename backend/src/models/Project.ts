import mongoose, { Schema, Document } from 'mongoose';
import { DesignElementType, DesignElement, DesignPage, DesignProject } from "@shared/types";


export interface ProjectDocument extends Document, Omit<DesignProject, "id" | "createdAt" | "updatedAt" | "createdBy" | "templateId"> {
  title: string;
  description?: string;
  templateId: mongoose.Types.ObjectId;
  pages: DesignPage[];
  createdAt: Date;
  updatedAt: Date;
  createdBy?: mongoose.Types.ObjectId;
}

const ElementContentSchema = new Schema<DesignElement>({
  placeholder: { type: String, required: true },
  type: { type: String, enum: ['text', 'image', 'shape', 'video'], required: true },
});

const PageContentSchema = new Schema<DesignPage>({
  elements: { type: [ElementContentSchema], default: [] },
});

const ProjectSchema = new Schema<ProjectDocument>(
  {
    title: { type: String, required: true },
    description: String,
    templateId: { type: Schema.Types.ObjectId, ref: 'Template', required: false },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User' },
    pages: { type: [PageContentSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model<ProjectDocument>('Project', ProjectSchema);
