import mongoose, { Document, Schema } from 'mongoose';

export interface IBrand extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor?: string;
  vibe: 'playful' | 'elegant' | 'bold' | 'minimal' | 'professional';
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
}

const brandSchema = new Schema<IBrand>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
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
  primaryColor: {
    type: String,
    required: true,
    match: /^#[0-9A-F]{6}$/i
  },
  secondaryColor: {
    type: String,
    required: true,
    match: /^#[0-9A-F]{6}$/i
  },
  accentColor: {
    type: String,
    match: /^#[0-9A-F]{6}$/i
  },
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

export const Brand = mongoose.model<IBrand>('Brand', brandSchema);
