export interface ElementStyle {
  fontSize?: string
  fontWeight?: string
  fontFamily?: string
  color?: string
  backgroundColor?: string
  shapeType?: 'rectangle' | 'circle' | 'triangle' | 'line'
  radius?: number
  strokeWidth?: number
  stroke?: string
}

export interface TemplateData {
  id: number
  name: string
  width: number
  height: number
  elements: {
    type: "text" | "image" | "shape"
    content: string
    x: number
    y: number
    width: number
    height: number
    style?: ElementStyle
  }[]
}