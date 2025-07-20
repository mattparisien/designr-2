export const toNumber = (v: unknown, fallback = 0) =>
  typeof v === 'number' ? v : Number.parseFloat(String(v)) || fallback;

export const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;')
   .replace(/</g, '&lt;')
   .replace(/>/g, '&gt;')
   .replace(/"/g, '&quot;');