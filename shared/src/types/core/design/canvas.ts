import { Size } from "./common";
import { DesignElement } from "./element";

export type CanvasSize = Size;

export type DesignCanvas = CanvasSize & {
    elements: DesignElement[];

}
