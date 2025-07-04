export interface FabricEvent {
  selected?: fabric.Object[];
  target?: fabric.Object;
}

export interface TemplateElement {
  type: 'text' | 'image' | 'shape';
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  style?: {
    fontSize?: string;
    fontFamily?: string;
    fontWeight?: string;
    color?: string;
    backgroundColor?: string;
    shapeType?: 'rectangle' | 'circle' | 'triangle' | 'line';
    radius?: number;
    strokeWidth?: number;
    stroke?: string;
  };
}

export interface GradientConfig {
  /** `'linear'` or `'radial'` – matches Fabric’s two gradient kinds */
  type: 'linear' | 'radial';

  /** Canvas-space coordinates (all are **pixels** on the Fabric canvas) */
  coords: {
    /** start-point ( x1, y1 ) and end-point ( x2, y2 ) for linear  
        OR centre → focus for radial */
    x1: number;
    y1: number;
    x2: number;
    y2: number;

    /** Radial-only – inner & outer radii (optional on linear) */
    r1?: number;
    r2?: number;
  };

  /** Array of colour stops, each 0 – 1 */
  colorStops: Array<{ offset: number; color: string }>;
}
