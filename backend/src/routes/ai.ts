import express, { Response } from "express";
import OpenAI from "openai";
import { authenticateToken, AuthRequest } from "../middleware/auth";
import { Telemetry } from "../models/Telemetry";

const router = express.Router();

// ────────────────────────────────────────────────────────────────
// Lazy OpenAI client
// ────────────────────────────────────────────────────────────────
let openai: OpenAI | null = null;
function getClient() {
  if (openai) return openai;
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  openai = new OpenAI({ apiKey: key });
  return openai;
}

// ────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────
/** Safely pull plain-text from a Responses API call */
function extractText(res: any): string {
  // If sdk >= 0.21 has .output_text shortcut use it
  // otherwise fall back to first content chunk
  return (
    res.output_text ??
    res.output?.[0]?.content?.[0]?.text ??
    JSON.stringify(res.output)
  );
}

/** Build the system prompt for either brand-field or template mode */
function buildSystemPrompt(
  ctx: any,
  vibe: string,
  isBrandFieldGen: boolean,
  currentContent?: any[]
) {
  const base = `
You may search the web to gain more information on the brand.

Brand Information:
- Brand Name: ${ctx?.name ?? "Generic brand"}
${ctx?.industry ? `- Industry: ${ctx.industry}` : ""}
${ctx?.tagline ? `- Tagline: ${ctx.tagline}` : ""}
- Brand Voice: ${ctx?.voice ?? "Professional and engaging"}
- Brand Personality: ${ctx?.personality ?? "Friendly and approachable"}
- Target Audience: ${ctx?.targetAudience ?? "General audience"}
- Tone Guidelines: ${
    ctx?.toneGuidelines ?? "Use clear, concise language that resonates"
  }
- Key Values: ${ctx?.keyValues ?? "Quality, innovation, customer satisfaction"}
- Communication Style: ${
    ctx?.communicationStyle ?? "Direct and informative"
  }
${ctx?.doNotUse ? `- Content to Avoid: ${ctx.doNotUse}` : ""}
${ctx?.preferredWords?.length ? `- Preferred Words: ${ctx.preferredWords.join(", ")}` : ""}
${ctx?.avoidedWords?.length ? `- Words to Avoid: ${ctx.avoidedWords.join(", ")}` : ""}
Content Vibe: ${vibe}
`;

  if (isBrandFieldGen) {
    return `You are an AI brand strategist. 
Generate ONLY the requested brand-field value as plain text.
IMPORTANT: Respect character limits:
- voice: 500 chars max
- personality: 500 chars max  
- targetAudience: 500 chars max
- toneGuidelines: 1000 chars max
- keyValues: 500 chars max
- communicationStyle: 500 chars max
- tagline: 200 chars max
\n${base}`;
  }

  let tmpl = `You are an AI copywriter for a design tool. 
Return a JSON with:
- headline (≤60 chars)
- bodyText (≤200 chars)\n${base}`;

  if (currentContent?.length) {
    const existing = currentContent
      .filter((e) => e.type === "text" && e.content)
      .map((e, i) => `${i + 1}. "${e.content}"`)
      .join("\n");
    tmpl += `\n\nCURRENT TEMPLATE TEXT:\n${existing}\n\nWhen updating, increment episode numbers, dates, etc., but keep structure.`;
  }
  return tmpl;
}

// ────────────────────────────────────────────────────────────────
// /magic-fill ─ main endpoint
// ────────────────────────────────────────────────────────────────
router.post(
  "/magic-fill",
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const { prompt, vibe = "professional", brandContext = {}, currentContent } =
        req.body;
      const userId = req.user?._id;

      if (!prompt) return res.status(400).json({ error: "Prompt is required" });

      const client = getClient();
      if (!client)
        return res
          .status(503)
          .json({ error: "OpenAI key missing on server" });

      // Detect brand-field generation
      const isField =
        /Respond with just the .* content/i.test(prompt ?? "");

      const system = buildSystemPrompt(
        brandContext,
        vibe,
        isField,
        currentContent
      );

      // one-shot Responses API call with web search enabled
      const response = await client.responses.create({
        model: "gpt-4o-mini",
        tools: [{ type: "web_search_preview_2025_03_11" }], // <-- built-in search
        tool_choice: "required",
        input: [
          { role: "system", content: system },
          { role: "user", content: prompt },
        ],
      });

      console.log('response', response);

      const rawText = extractText(response);

      // brand-field → return as plain text
      let content: any;
      if (isField) {
        content = rawText.trim();
      } else {
        try {
          content = JSON.parse(rawText);
        } catch {
          // fallback in case model didn't return JSON
          content = { headline: rawText.slice(0, 60), bodyText: rawText };
        }
      }

      // telemetry
      if (userId) {
        await new Telemetry({
          userId,
          event: "aiSuggestUsed",
          data: { prompt, vibe, hasResult: true },
        }).save();
      }

      res.json({ success: true, content, usage: response.usage });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "AI generation failed" });
    }
  }
);

// ────────────────────────────────────────────────────────────────
// /variations – same idea, but simpler prompt
// ────────────────────────────────────────────────────────────────
router.post(
  "/variations",
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const { baseContent, vibe = "professional", count = 3 } = req.body;
      const userId = req.user?._id;

      if (!baseContent)
        return res.status(400).json({ error: "Base content is required" });

      const client = getClient();
      if (!client)
        return res
          .status(503)
          .json({ error: "OpenAI key missing on server" });

      const response = await client.responses.create({
        model: "gpt-4o-mini",
        tools: [{ type: "web_search_preview_2025_03_11" }],
        input: `Create ${count} variations of the following marketing copy in a ${vibe} tone. 
Return an array of JSON objects with headline and bodyText.\n\n${JSON.stringify(
          baseContent
        )}`,
      });

      let variations: any[];
      try {
        variations = JSON.parse(extractText(response));
      } catch {
        variations = [baseContent]; // fallback
      }

      if (userId) {
        await new Telemetry({
          userId,
          event: "aiVariationsGenerated",
          data: { count: variations.length, vibe },
        }).save();
      }

      res.json({ success: true, variations, usage: response.usage });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "AI variations generation failed" });
    }
  }
);

export default router;
