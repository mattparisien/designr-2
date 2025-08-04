import { DesignPage, DesignProject } from "@shared/types";
import mongoose, { Document, Schema } from 'mongoose';
import { PageSchema } from 'src/schemas';

export interface ProjectDocument extends Document, Omit<DesignProject, "id" | "createdAt" | "updatedAt" | "createdBy" | "templateId"> {
  title: string;
  description?: string;
  templateId: mongoose.Types.ObjectId;
  pages: DesignPage[];
  createdAt: Date;
  updatedAt: Date;
  createdBy?: mongoose.Types.ObjectId;
}

const ProjectSchema = new Schema<ProjectDocument>(
  {
    title: { type: String, required: true },
    description: String,
    templateId: { type: Schema.Types.ObjectId, ref: 'Template', required: false },
    pages: { type: [PageSchema], default: [] },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    updatedAt: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model<ProjectDocument>('Project', ProjectSchema);
