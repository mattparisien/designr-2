import { Object } from "../object";

// You can keep it broad or narrow it later with a runtime validator
export type HexColor = `#${string}`;

export type BrandVibe =
  | 'playful'
  | 'elegant'
  | 'bold'
  | 'minimal'
  | 'professional';

export interface Brand extends Object {
  name: string;
  logoUrl?: string;
  primaryColor: HexColor;
  secondaryColor: HexColor;
  accentColor?: HexColor;
  vibe: BrandVibe;
  voice: string;
  personality: string;
  targetAudience: string;
  toneGuidelines: string;
  keyValues: string;
  communicationStyle: string;
  industry?: string;
  tagline?: string;
  doNotUse?: string;
  preferredWords?: string[];
  avoidedWords?: string[];
}
