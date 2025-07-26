
/**
 * Generic item for use in popover/dropdown selection UIs.
 * Can represent formats, templates, presets, or any categorized selectable item.
 */
export interface SelectionItem {
    key: string;
    label: string;
    description?: string; // Subtitle or extra info (e.g. dimensions, type, etc)
    category: string;
    data?: Record<string, unknown>; // Any extra data needed for creation/selection
}

/**
 * Configuration for a popover/dropdown selection UI.
 * Used to group items by category and render them dynamically.
 */
export interface SelectionConfig {
    categories: string[];
    items: SelectionItem[];
}
