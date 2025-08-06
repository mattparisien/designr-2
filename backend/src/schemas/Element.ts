import { DesignElement, DesignImageElement, DesignShapeElement, DesignTextElement } from '@shared/types';
import { Schema } from 'mongoose';

// Base Element Schema (with discriminatorKey)
const BaseElementSchema = new Schema<DesignElement>(
  {
    type: { type: String, required: true, enum: ['text', 'shape', 'image', 'line'] },
    placeholder: { type: String },
    rect: {
      x: { type: Number, required: true },
      y: { type: Number, required: true },
      width: { type: Number, required: true },
      height: { type: Number, required: true },
    },
  },
  { _id: true, discriminatorKey: 'type' }
);

// Text Element Discriminator
const TextElementSchema = new Schema<DesignTextElement>(
  {
    content: { type: String, required: true },
    fontSize: { type: Number },
    fontFamily: { type: String },
    textAlign: { type: String, enum: ['left', 'center', 'right'] },
    letterSpacing: { type: Number },
    lineHeight: { type: Number },
    isBold: { type: Boolean },
    isItalic: { type: Boolean },
    isUnderline: { type: Boolean },
    isStrikethrough: { type: Boolean },
    color: { type: String },
  },
  { _id: true }
);

// Shape Element Discriminator
const ShapeElementSchema = new Schema<DesignShapeElement>(
  {
    form: { type: String, enum: ['rectangle', 'circle', 'line'], required: true },
    backgroundColor: { type: String },
    borderColor: { type: String },
    borderWidth: { type: Number },
  },
  { _id: false }
);

// // Line Element Discriminator
// const LineElementSchema = new Schema<>(
//   {
//     backgroundColor: { type: String },
//     width: { type: Number }
//   },
//   { _id: true }
// );

// Image Element Discriminator
const ImageElementSchema = new Schema<DesignImageElement>(
  {
    src: { type: String, required: true },
    alt: { type: String },
  },
  { _id: false }
);

// Discriminators
BaseElementSchema.discriminator('text', TextElementSchema);
BaseElementSchema.discriminator('shape', ShapeElementSchema);
// BaseElementSchema.discriminator('line', LineElementSchema);
BaseElementSchema.discriminator('image', ImageElementSchema);

// Export the schema to embed in Page, etc.
export { BaseElementSchema as ElementSchema };
