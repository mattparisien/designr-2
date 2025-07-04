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

export interface Brand {
  _id: string
  name: string
  logoUrl?: string
  primaryColor: string
  secondaryColor: string
  accentColor?: string
  vibe: "playful" | "elegant" | "bold" | "minimal" | "professional"
  voice: string
  personality: string
  targetAudience: string
  toneGuidelines: string
  keyValues: string
  communicationStyle: string
  industry?: string
  tagline?: string
  doNotUse?: string
  preferredWords: string[]
  avoidedWords: string[]
  createdAt: string
  updatedAt: string
}

export interface BrandData {
  name: string
  primaryColor: string
  secondaryColor: string
  vibe: string
  voice?: string
  personality?: string
  targetAudience?: string
  toneGuidelines?: string
  keyValues?: string
  communicationStyle?: string
}