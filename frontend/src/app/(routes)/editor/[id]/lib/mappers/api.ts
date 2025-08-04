import { DesignElement as APIDesignElement, DesignPage as APIDesignPage } from "@shared/types"
import { Page, Element } from "../types/canvas"

export const mapElement = (element: APIDesignElement): Element => {
    return {
        ...element,
        isNew: false // Default to false, can be updated later
    };
};

export const mapPage = (page: APIDesignPage): Page => {
    return {
        ...page,
        canvas: {
            ...page.canvas,
            elements: [
                ...page.canvas.elements.map(mapElement)
            ]
        }
    };
};