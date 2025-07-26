import { SelectionConfig, SelectionItem } from "../types/config";
import { DesignFormat } from "@/app/(routes)/(site)/templates/page";

export const mapDesignFormatToSelectionConfig = (format: Record<string, DesignFormat>): SelectionConfig => {
    // Extract unique categories
    const categories = [...new Set(Object.values(format).map(format => format.category))];

    // Transform formats into selection items
    const items: SelectionItem[] = Object.entries(format).map(([key, format]) => ({
        key,
        label: format.name,
        description: `${format.width} × ${format.height}`,
        category: format.category,
        data: {
            width: format.width,
            height: format.height
        }
    }));

    return {
        categories,
        items
    };
};