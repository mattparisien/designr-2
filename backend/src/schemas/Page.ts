
import { DesignPage } from "@shared/types";
import { Schema } from "mongoose";
import { ElementSchema } from "./Element";

export const PageSchema = new Schema<DesignPage>({
    canvas: {
        elements: { type: [ElementSchema], default: [] },
        width: { type: Number, required: true },
        height: { type: Number, required: true },
    }
});

PageSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    // Mutate only what's necessary
    if (ret._id) ret.id = ret._id.toString();
    delete ret._id;
    // Don't replace or deeply clone 'ret'
    return ret;
  }
});