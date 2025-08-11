import { type BrandVibe as CoreBrandVibe, type Brand as CoreBrand } from '@shared/types/core/brand';
import { OmitCreate } from '@shared/types/utils/omit';
import mongoose, { Document, Schema } from 'mongoose';

type Color = {
  hex: `#${string}`;
}

interface Palette {
  colors: Color[];
}

export interface BrandDocument extends Document, OmitCreate<CoreBrand> {
  userId: mongoose.Types.ObjectId;
  name: string;
  logoUrl?: string;
  palettes: Palette[];
  vibe: CoreBrandVibe;
  voice: string;
  personality: string;
  targetAudience: string;
  toneGuidelines: string;
  keyValues: string;
  communicationStyle: string;
  industry?: string;
  tagline?: string;
  doNotUse?: string;
  preferredWords?: string[];
  avoidedWords?: string[];
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
}

const brandSchema = new Schema<BrandDocument>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  logoUrl: {
    type: String,
    trim: true
  },
  palettes: [{
    colors: [{
      hex: {
        type: String,
        required: true,
        match: /^#[0-9A-F]{6}$/i
      }
    }],
  }],
  vibe: {
    type: String,
    enum: ['playful', 'elegant', 'bold', 'minimal', 'professional'],
    required: true
  },
  voice: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500,
    default: 'Professional and engaging'
  },
  personality: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500,
    default: 'Friendly and approachable'
  },
  targetAudience: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500,
    default: 'General audience'
  },
  toneGuidelines: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000,
    default: 'Use clear, concise language that resonates with the audience'
  },
  keyValues: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500,
    default: 'Quality, innovation, customer satisfaction'
  },
  communicationStyle: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500,
    default: 'Direct and informative'
  },
  industry: {
    type: String,
    trim: true,
    maxlength: 100
  },
  tagline: {
    type: String,
    trim: true,
    maxlength: 200
  },
  doNotUse: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  preferredWords: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  avoidedWords: [{
    type: String,
    trim: true,
    maxlength: 50
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create index for efficient querying
brandSchema.index({ userId: 1, createdAt: -1 });

export const Brand = mongoose.model<BrandDocument>('Brand', brandSchema);
