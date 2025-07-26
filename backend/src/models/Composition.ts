import mongoose, { Document, Schema } from 'mongoose';

// Define the shape of a page in the composition
interface ICompositionPage {
  name: string;
  canvas?: {
    width: number;
    height: number;
  };
  background?: {
    type: string;
    value?: string;
  };
  elements?: Array<Record<string, any>>;
}

// Define the composition data structure
interface ICompositionData {
  pages: ICompositionPage[];
  canvasSize?: {
    name?: string;
    width: number;
    height: number;
  };
  [key: string]: any; // Allow additional properties
}

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
  compositionData: ICompositionData; // Strongly typed composition data with required pages
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
    required: true,
    // We'll use the pre-save hook to ensure pages exist instead of validating here
    default: () => ({ pages: [] }) // Default to an object with empty pages array
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

// Check if data was passed in a different property and move it to compositionData
compositionSchema.pre('validate', function(this: any, next) {
  try {
    const doc = this._doc || this;
    
    // If data was provided but compositionData wasn't, use data
    if (doc.data && (!doc.compositionData || Object.keys(doc.compositionData).length === 0)) {
      console.log('Moving data to compositionData');
      this.compositionData = doc.data;
      // Don't delete doc.data as it might be needed elsewhere
    }
    
    next();
  } catch (error) {
    console.error('Error in pre-validate hook:', error);
    next(error instanceof Error ? error : new Error(String(error)));
  }
});

// Pre-save hook to generate slug and ensure compositionData has required fields
compositionSchema.pre('save', function(this: IComposition, next) {
  try {
    // Generate slug if not provided
    if (!this.slug) {
      const baseSlug = (this.title || this.name)
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      
      this.slug = `${baseSlug}-${Date.now()}`;
    }
    
    // Ensure compositionData is an object
    if (!this.compositionData || typeof this.compositionData !== 'object') {
      console.log('Initializing empty compositionData object');
      this.compositionData = { pages: [] };
    } 
    
    // Handle case where data was sent as string (from JSON)
    else if (typeof this.compositionData === 'string') {
      try {
        console.log('Converting string compositionData to object');
        this.compositionData = JSON.parse(this.compositionData);
      } catch (error) {
        console.log('Error parsing compositionData string, initializing empty object');
        this.compositionData = { pages: [] };
      }
    }

    // Ensure compositionData has a pages array
    if (!this.compositionData.pages) {
      console.log('Adding empty pages array to compositionData');
      this.compositionData.pages = [];
    } else if (!Array.isArray(this.compositionData.pages)) {
      console.log('Converting non-array pages to array');
      this.compositionData.pages = [this.compositionData.pages];
    }
    
    next();
  } catch (error) {
    console.error('Error in pre-save hook:', error);
    next(error instanceof Error ? error : new Error(String(error)));
  }
});

export const Composition = mongoose.model<IComposition>('Composition', compositionSchema);
