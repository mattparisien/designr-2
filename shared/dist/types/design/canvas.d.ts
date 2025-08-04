import { Size } from "./common";
import { DesignElement } from "./element";
export type CanvasSize = Size;
export interface DesignCanvas {
    name: string;
    elements: DesignElement[];
}
