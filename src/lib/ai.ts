import Anthropic from "@anthropic-ai/sdk";

const MODEL = "claude-haiku-4-5-20251001";
const MAX_INPUT_CHARS = 40_000;

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set.");
    client = new Anthropic({ apiKey });
  }
  return client;
}

export type Distilled = {
  summary: string;
  tags: string[];
};

const SYSTEM_PROMPT = `You are a careful reading assistant. Given the text of a saved article, you produce:

1. A concise TL;DR — 2 to 4 sentences that capture the article's central argument or takeaway. Neutral tone, no filler like "the article says". Write as if summarizing to a smart friend who won't read it.

2. Between 2 and 5 short lowercase tags (single words or short hyphenated phrases) describing topic and format. Prefer specific over generic: "monetary-policy" over "economics", "postmortem" over "engineering". Never fabricate tags that aren't grounded in the text.

Respond ONLY with a JSON object matching this exact shape:
{"summary": "...", "tags": ["tag1", "tag2"]}

No prose before or after. No markdown fences.`;

export async function distill(title: string, text: string): Promise<Distilled> {
  const trimmed = text.length > MAX_INPUT_CHARS ? text.slice(0, MAX_INPUT_CHARS) : text;
  const c = getClient();

  const msg = await c.messages.create({
    model: MODEL,
    max_tokens: 512,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Title: ${title}\n\nText:\n${trimmed}`,
      },
    ],
  });

  const block = msg.content.find((b): b is Anthropic.TextBlock => b.type === "text");
  if (!block) throw new Error("Claude returned no text content.");

  const parsed = safeParseJson(block.text);
  const summary = typeof parsed.summary === "string" ? parsed.summary.trim() : "";
  const rawTags = Array.isArray(parsed.tags) ? parsed.tags : [];
  const tags = rawTags
    .filter((t): t is string => typeof t === "string")
    .map((t) => t.toLowerCase().trim())
    .filter(Boolean)
    .slice(0, 5);

  if (!summary) throw new Error("Claude returned an empty summary.");

  return { summary, tags };
}

function safeParseJson(text: string): { summary?: unknown; tags?: unknown } {
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/```$/, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error("Could not parse Claude's JSON response.");
  }
}
