import { CreateDesignProjectRequest } from "@shared/types";
import { DESIGN_FORMATS } from "../constants";
import { nanoid } from "nanoid";

export const createProject = (formatKey: string, customTitle?: string): CreateDesignProjectRequest => {
    const format = DESIGN_FORMATS[formatKey as keyof typeof DESIGN_FORMATS];

    if (!format) {
        throw new Error(`Unknown design format: ${formatKey}`);
    }

    return {
        title: customTitle || format.name,
        description: `A ${format.name.toLowerCase()} project`,
        pages: [
            {
                id: nanoid(),
                canvas: {
                    width: format.width,
                    height: format.height,
                    elements: [],
                },
            },
        ],
    } as CreateDesignProjectRequest;
};