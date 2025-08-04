
import { DesignPage } from "@shared/types";
import { Schema } from "mongoose";
import { ElementSchema } from "./Element";

export const PageSchema = new Schema<DesignPage>({
    canvas: {
        elements: { type: [ElementSchema], default: [] },
    }
});