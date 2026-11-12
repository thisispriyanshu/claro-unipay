import { streamText, type CoreMessage } from "ai";
import { model, hasModelKey } from "@/lib/ai";
import { buildTools, buildPayPalToolkitTools } from "@/lib/agent/tools";
import { SYSTEM_PROMPT } from "@/lib/agent/prompt";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  if (!hasModelKey) {
    return new Response(
      JSON.stringify({ error: "OPENAI_API_KEY is not set. Add it to .env.local." }),
      { status: 503, headers: { "Content-Type": "application/json" } },
    );
  }

  const { messages } = (await req.json()) as { messages: CoreMessage[] };

  const tools = {
    ...buildTools(),
    ...(await buildPayPalToolkitTools()),
  };

  const result = streamText({
    model,
    system: SYSTEM_PROMPT,
    messages,
    tools,
    maxSteps: 12,
    onError: (e) => console.error("[agent] streamText error:", e),
  });

  return result.toDataStreamResponse({
    getErrorMessage: (e) => (e instanceof Error ? e.message : String(e)),
  });
}
