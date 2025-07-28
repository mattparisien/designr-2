import { CreateProjectPayload } from "../types/api";
import { DESIGN_FORMATS } from "../constants";

export const createProject = (formatKey: string, customTitle?: string): CreateProjectPayload => {
    const format = DESIGN_FORMATS[formatKey as keyof typeof DESIGN_FORMATS];

    if (!format) {
        throw new Error(`Unknown design format: ${formatKey}`);
    }

    return {
        title: customTitle || format.name,
        description: `A ${format.name.toLowerCase()} project`,
        pages: [
            {
                templatePageIndex: 0,
                elements: [], // Start with no elements - user will add them
            }
        ],
    };
};