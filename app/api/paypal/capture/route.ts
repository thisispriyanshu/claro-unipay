import { captureOrder, hasPayPalCreds } from "@/lib/paypal";

export const runtime = "nodejs";

// Captures an approved PayPal order. Called from the Buttons onApprove() after the buyer
// approves in the sandbox popup.
export async function POST(req: Request) {
  if (!hasPayPalCreds()) return json({ error: "PayPal not configured" }, 503);
  try {
    const { orderId } = (await req.json()) as { orderId: string };
    if (!orderId || !/^[A-Z0-9-]{8,80}$/i.test(orderId)) {
      return json({ error: "Invalid orderId" }, 400);
    }
    const result = await captureOrder(orderId);
    return json(result);
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : String(e) }, 500);
  }
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
