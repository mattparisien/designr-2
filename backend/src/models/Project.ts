import mongoose, { Document, Schema } from 'mongoose';

export interface IProject extends Document {
  name: string;
  title: string;
  slug: string;
  description?: string;
  category: string;
  type: string;
  width: number;
  height: number;
  thumbnailUrl: string;
  projectData: Record<string, unknown>; // JSON structure for the project
  tags: string[];
  starred: boolean;
  shared: boolean;
  featured: boolean;
  popular: boolean;
  isActive: boolean;
  userId?: string; // Owner of the project
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<IProject>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    required: true,
    default: 'design'
  },
  type: {
    type: String,
    required: true,
    default: 'custom'
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
    required: false,
    default: ''
  },
  projectData: {
    type: Schema.Types.Mixed,
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  starred: {
    type: Boolean,
    default: false
  },
  shared: {
    type: Boolean,
    default: false
  },
  featured: {
    type: Boolean,
    default: false
  },
  popular: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  userId: {
    type: String,
    required: false
  }
}, {
  timestamps: true
});

// Pre-save hook to generate slug if not provided
projectSchema.pre('save', function(next) {
  if (!this.slug) {
    const baseSlug = (this.title || this.name)
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    
    this.slug = `${baseSlug}-${Date.now()}`;
  }
  next();
});

export const Project = mongoose.model<IProject>('Project', projectSchema);
