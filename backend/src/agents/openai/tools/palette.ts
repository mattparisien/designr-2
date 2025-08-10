import { tool } from '@openai/agents';

// Color helpers
function clamp(n: number, min = 0, max = 255) { return Math.max(min, Math.min(max, n)); }
function hex(n: number) { return clamp(Math.round(n)).toString(16).padStart(2, '0'); }
function toRgb(h: string) {
  const m = /^#?([0-9a-fA-F]{6})$/.exec(h);
  if (!m) return { r: 0, g: 0, b: 0 };
  const int = parseInt(m[1], 16);
  return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 };
}
function toHex({ r, g, b }: { r: number; g: number; b: number }) {
  return `#${hex(r)}${hex(g)}${hex(b)}`.toLowerCase();
}
function jitter(rgb: { r: number; g: number; b: number }, amount = 24) {
  return toHex({ r: rgb.r + (Math.random() * 2 - 1) * amount, g: rgb.g + (Math.random() * 2 - 1) * amount, b: rgb.b + (Math.random() * 2 - 1) * amount });
}
function randHex() {
  return `#${Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0')}`.toLowerCase();
}
function distinctize(colors: string[]) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const c of colors) {
    const lc = c.toLowerCase();
    if (!seen.has(lc)) { seen.add(lc); out.push(lc); }
  }
  return out;
}

// Simple vibe seeds
const vibeSeeds: Record<string, string[]> = {
  playful: ['#ff6b6b', '#ffd166', '#06d6a0', '#118ab2', '#ef476f'],
  elegant: ['#2d3142', '#bfc0c0', '#e5e5e5', '#a9927d', '#c9ada7'],
  bold: ['#000000', '#ff1b1c', '#ff9f1c', '#2ec4b6', '#e71d36'],
  minimal: ['#111111', '#f2f2f2', '#cfcfcf', '#8c8c8c', '#dcdcdc'],
  professional: ['#1f3a5f', '#4a6fa5', '#e1e5f2', '#d0e1f9', '#1b263b'],
};

function paletteFromVibe(vibe: string | undefined | null, count: number): string[] {
  const v = (vibe ?? undefined) as string | undefined;
  const base = v && vibeSeeds[v] ? [...vibeSeeds[v]] : [randHex(), randHex(), randHex(), randHex(), randHex()];
  const out: string[] = [];
  while (out.length < count) {
    const seed = base[out.length % base.length];
    out.push(jitter(toRgb(seed), 18));
  }
  return distinctize(out).slice(0, count);
}

// Accessibility helpers
function relLuminance(hx: string) {
  const { r, g, b } = toRgb(hx);
  const srgb = [r, g, b].map(v => v / 255).map(v => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
}
function contrastRatio(a: string, b: string) {
  const L1 = relLuminance(a); const L2 = relLuminance(b);
  const [hi, lo] = L1 > L2 ? [L1, L2] : [L2, L1];
  return (hi + 0.05) / (lo + 0.05);
}

export const paletteTool = tool({
  name: 'fetch_palette',
  description:
    'Given a Brand object, recommend primaryColor, secondaryColor, and accentColor aligned to its vibe, audience, and industry. Returns only these three hex colors.',
  parameters: {
    type: 'object',
    additionalProperties: false,
    required: ['brand', 'count', 'goal'],
    properties: {
      brand: {
        type: 'object',
        additionalProperties: false,
        required: ['primaryColor', 'secondaryColor', 'accentColor'],
        properties: {
          primaryColor: { type: 'string' },
          secondaryColor: { type: 'string'  },
          accentColor: { type: 'string'  },
        },
      },
      count: { type: ['integer','null'], minimum: 3, maximum: 8 },
      goal: { type: ['string','null'], minLength: 0 },
    },
  } as const,
  async execute(input: any) {

    const brand = (input.brand ?? {}) as Record<string, any>;
    const count = typeof input.count === 'number' ? input.count : 5;
    const goal: string | null = typeof input.goal === 'string' ? input.goal : null;

    const vibe: string | null = typeof brand.vibe === 'string' ? brand.vibe : null;

    // Start with provided colors when available, then expand
    let swatches: string[] = [];
    const provided = [brand.primaryColor, brand.secondaryColor, brand.accentColor].filter(Boolean) as string[];

    if (provided.length) {
      // Build around the first provided color
      const base = toRgb(provided[0]!);
      swatches = distinctize([
        ...provided,
        jitter(base, 18),
        jitter(base, 28),
        ...paletteFromVibe(vibe, Math.max(count - provided.length, 0)),
      ]).slice(0, Math.max(count, 3));
    } else {
      swatches = paletteFromVibe(vibe, Math.max(count, 3));
    }

    // Ensure at least 3 swatches
    if (swatches.length < 3) {
      swatches = distinctize([...swatches, ...paletteFromVibe(vibe, 3 - swatches.length)]);
    }

    // Assign primary/secondary/accent (preserve provided when present)
    const primaryColor = brand.primaryColor ?? swatches[0];
    const secondaryColor = brand.secondaryColor ?? swatches.find(c => c !== primaryColor) ?? swatches[1];
    const accentColor = brand.accentColor ?? swatches.find(c => c !== primaryColor && c !== secondaryColor) ?? swatches[2];

    // Return only the three colors as requested
    return {
      primaryColor,
      secondaryColor,
      accentColor,
    };
  }
});
