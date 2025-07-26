import mongoose, { Document, Schema } from 'mongoose';

export interface IComposition extends Document {
  name: string;
  title: string;
  slug: string;
  description?: string;
  category: string;
  type: string;
  width: number;
  height: number;
  thumbnailUrl: string;
  compositionData: Record<string, unknown>; // JSON structure for the composition
  isTemplate: boolean; // Flag to distinguish between projects and templates
  role: 'project' | 'template'; // Role of the composition
  tags: string[];
  starred: boolean;
  shared: boolean;
  featured: boolean;
  popular: boolean;
  isActive: boolean;
  userId?: string; // Owner of the composition
  createdAt: Date;
  updatedAt: Date;
}

const compositionSchema = new Schema<IComposition>({
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
  compositionData: {
    type: Schema.Types.Mixed,
    required: true
  },
  isTemplate: {
    type: Boolean,
    required: true,
    default: false
  },
  role: {
    type: String,
    required: true,
    enum: ['project', 'template'],
    default: 'project'
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
compositionSchema.pre('save', function(this: IComposition, next) {
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

export const Composition = mongoose.model<IComposition>('Composition', compositionSchema);
