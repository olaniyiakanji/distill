import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

const MODEL = "gemini-2.0-flash";
const MAX_INPUT_CHARS = 40_000;

let client: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI {
  if (!client) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is not set.");
    client = new GoogleGenerativeAI(apiKey);
  }
  return client;
}

export type Distilled = {
  summary: string;
  tags: string[];
};

const SYSTEM_PROMPT = `You are a careful reading assistant. Given the text of a saved article, produce two things:

1. A concise TL;DR — 2 to 4 sentences capturing the article's central argument or takeaway. Neutral tone, no filler like "the article says". Write as if summarizing to a smart friend who won't read it.

2. Between 2 and 5 short lowercase tags (single words or short hyphenated phrases) describing topic and format. Prefer specific over generic: "monetary-policy" over "economics", "postmortem" over "engineering". Never fabricate tags that aren't grounded in the text.`;

export async function distill(title: string, text: string): Promise<Distilled> {
  const trimmed = text.length > MAX_INPUT_CHARS ? text.slice(0, MAX_INPUT_CHARS) : text;

  const model = getClient().getGenerativeModel({
    model: MODEL,
    systemInstruction: SYSTEM_PROMPT,
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          summary: { type: SchemaType.STRING },
          tags: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
          },
        },
        required: ["summary", "tags"],
      },
      maxOutputTokens: 512,
      temperature: 0.3,
    },
  });

  const result = await model.generateContent(`Title: ${title}\n\nText:\n${trimmed}`);
  const raw = result.response.text();

  const parsed = JSON.parse(raw) as { summary?: unknown; tags?: unknown };

  const summary = typeof parsed.summary === "string" ? parsed.summary.trim() : "";
  const rawTags = Array.isArray(parsed.tags) ? parsed.tags : [];
  const tags = rawTags
    .filter((t): t is string => typeof t === "string")
    .map((t) => t.toLowerCase().trim())
    .filter(Boolean)
    .slice(0, 5);

  if (!summary) throw new Error("Model returned an empty summary.");

  return { summary, tags };
}
