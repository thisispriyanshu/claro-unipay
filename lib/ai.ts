// OpenAI model provider via the Vercel AI SDK.
// The user supplies OPENAI_API_KEY; model is overridable with OPENAI_MODEL.

import { createOpenAI } from "@ai-sdk/openai";

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const MODEL_ID = process.env.OPENAI_MODEL ?? "gpt-4o";

export const model = openai(MODEL_ID);

export const hasModelKey = Boolean(process.env.OPENAI_API_KEY);
