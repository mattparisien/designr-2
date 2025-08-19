import { DesignPage, DesignProject } from "@shared/types";
import mongoose, { Document, Schema } from 'mongoose';
import { PageSchema } from 'src/schemas';

export interface ProjectDocument extends Document, Omit<DesignProject, "id" | "createdAt" | "updatedAt" | "createdBy" | "templateId"> {
  title: string;
  description?: string;
  templateId?: mongoose.Types.ObjectId;
  thumbnailUrl?: string;
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
    thumbnailUrl: { type: String, required: false },
    pages: { type: [PageSchema], default: [] },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    updatedAt: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

ProjectSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    // Mutate only what's necessary
    if (ret._id) ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  }
});

export default mongoose.model<ProjectDocument>('Project', ProjectSchema);
