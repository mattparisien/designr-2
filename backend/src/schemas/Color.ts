import { Schema } from "mongoose";

// Color tokens live on the Template/Project (or Brand) doc
const ColorTokenSchema = new Schema({
  id: { type: String, required: true },       // stable id from FE (e.g., nanoid)
  name: { type: String, required: true },     // "Primary 500"
  value: { type: String, required: true },    // "#3B82F6" (canonical hex)
  role: { type: String, enum: ["primary","secondary","accent","neutral","foreground","support"] },
  usage: [{ type: String, enum: ["fills","text","strokes","effects"] }],
  locked: { type: Boolean, default: false },
  meta: { type: Schema.Types.Mixed }
}, { _id: false });
