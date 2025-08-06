import { CreateDesignTemplateRequest } from "@shared/types";
import { v4 as uuid } from 'uuid';
import { DESIGN_FORMATS } from "../constants";
import { DEFAULT_CANVAS_SIZE } from "@/app/(routes)/editor/[id]/lib/constants";

export const createTemplate = (formatKey: string, customTitle?: string): CreateDesignTemplateRequest => {
    const format = DESIGN_FORMATS[formatKey as keyof typeof DESIGN_FORMATS];

    if (!format) {
        throw new Error(`Unknown design format: ${formatKey}`);
    }

    // Map category to template category
    const getCategoryType = (category: string): "presentation" | "social" | "print" | "custom" => {
        const socialCategories = ["Instagram", "TikTok", "YouTube", "Facebook", "Twitter", "LinkedIn", "Pinterest"];
        const printCategories = ["Print", "Business Card", "Flyer", "Poster"];
        const presentationCategories = ["Presentation", "Slide"];

        if (socialCategories.includes(category)) return "social";
        if (printCategories.includes(category)) return "print";
        if (presentationCategories.includes(category)) return "presentation";
        return "custom";
    };

    return {
        title: customTitle || format.name,
        description: `A ${format.name.toLowerCase()} template`,
        category: getCategoryType(format.category),
        tags: [],
        pages: [
            {
                id: uuid(),
                canvas: {
                    elements: [], // Start with no elements - user will add them
                    width: format.width || DEFAULT_CANVAS_SIZE.width,
                    height: format.height || DEFAULT_CANVAS_SIZE.height
                }
            }
        ],
    };
};