import { DESIGN_FORMATS } from "../constants";
import { CreateTemplatePayload } from "../types/api";

export const createTemplate = (formatKey: string, customTitle?: string): CreateTemplatePayload => {
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
        canvasSize: {
            width: format.width,
            height: format.height,
        },
        pages: [
            {
                name: "Page 1",
                background: {
                    type: "color",
                    value: "#ffffff",
                },
                elements: [], // Start with no elements - user will add them
            }
        ],
        isPublic: false,
    };
};