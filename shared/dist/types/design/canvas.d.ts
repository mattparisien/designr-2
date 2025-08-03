import { DesignElement } from "./element";
export interface DesignCanvas {
    id: string;
    name: string;
    elements: DesignElement[];
}
