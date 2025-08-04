import { DesignElement } from "@shared/types";
import e from "cors";
import { Schema } from "mongoose";

export const ElementSchema = new Schema<DesignElement>({
  type: { type: String, enum: ['text', 'image', 'shape', 'video'], required: true },
  placeholder: String,
  position: {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
  },
  size: {
    width: { type: Number, required: true },
    height: { type: Number, required: true },
  }
});