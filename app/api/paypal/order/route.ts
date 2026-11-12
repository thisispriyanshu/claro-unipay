import { createOrder, hasPayPalCreds, type PurchaseUnit } from "@/lib/paypal";
import { splitToReceivers, type OutfitLineItem } from "@/lib/merchants";

export const runtime = "nodejs";

// Creates a single PayPal order split across the outfit's merchants: the server groups the
// line items by merchant, maps each merchant to a sandbox business payee, and builds one
// purchase_unit per payee. At capture, PayPal routes each unit's amount to that payee.
// The PayPal Buttons call this in createOrder() and get back { id, split }.
export async function POST(req: Request) {
  if (!hasPayPalCreds()) return json({ error: "PayPal not configured" }, 503);
  try {
    const { items, currency } = (await req.json()) as {
      items: OutfitLineItem[];
      currency?: string;
    };
    if (!Array.isArray(items) || items.length === 0) {
      return json({ error: "No items to purchase" }, 400);
    }

    const normalizedCurrency = (currency ?? "USD").toUpperCase();
    if (!/^[A-Z]{3}$/.test(normalizedCurrency)) {
      return json({ error: "Invalid currency" }, 400);
    }
    if (
      items.some(
        (item) =>
          !item ||
          typeof item.merchant !== "string" ||
          !item.merchant.trim() ||
          typeof item.price !== "number" ||
          !Number.isFinite(item.price) ||
          item.price <= 0 ||
          item.price > 100_000,
      )
    ) {
      return json({ error: "Each item must have a valid positive price and merchant" }, 400);
    }

    const total = items.reduce((sum, item) => sum + item.price, 0);
    if (!Number.isFinite(total) || total > 100_000) {
      return json({ error: "Order total is outside the supported range" }, 400);
    }

    const split = splitToReceivers(items);
    if (split.length === 0) {
      return json({ error: "No merchant receiver accounts configured (DEMO_MERCHANT_EMAILS)" }, 400);
    }

    const units: PurchaseUnit[] = split.map((s, i) => ({
      referenceId: `m${i + 1}`,
      amount: s.amount,
      payeeEmail: s.receiver,
      description: `Claro — ${s.merchants.join(", ")}`,
    }));

    const order = await createOrder(units, normalizedCurrency);
    return json({ id: order.id, status: order.status, split });
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
