// The agent's tool belt, assembled for the Vercel AI SDK.
//
//  - search_products   → Channel3 discovery
//  - price_outfit      → budget guardrail (enforced in code, not just the prompt)
//  - PayPal Agent Toolkit tools (create_order, get_order) → the agent transacts via PayPal
//  - capture_order     → our REST client (buyer approves in the UI first)
//
// Payment itself (a single multi-payee order that splits to each merchant) runs through the
// UI's PayPal Buttons; the toolkit tools are added only when PayPal creds exist.

import { tool } from "ai";
import { z } from "zod";
import { searchProducts } from "@/lib/channel3";
import { captureOrder, hasPayPalCreds } from "@/lib/paypal";

export function buildTools() {
  const tools: Record<string, any> = {
    search_products: tool({
      description:
        "Search real products across stores via Channel3. Call once per outfit slot " +
        "(top, bottom, shoes, accessory, outer). Respects a max price per item.",
      parameters: z.object({
        query: z.string().describe("Natural-language product query, e.g. 'earthy linen shirt'"),
        maxPrice: z.number().optional().describe("Max price for this item in the budget currency"),
        category: z.string().optional(),
        limit: z.number().optional().default(6),
      }),
      execute: async ({ query, maxPrice, category, limit }) => {
        const products = await searchProducts({ query, maxPrice, category, limit });
        return {
          count: products.length,
          products: products.map((p) => ({
            id: p.id,
            title: p.title,
            merchant: p.merchant,
            price: p.price,
            currency: p.currency,
            imageUrl: p.imageUrl,
            buyUrl: p.buyUrl,
            category: p.category,
          })),
        };
      },
    }),

    price_outfit: tool({
      description:
        "Validate a proposed outfit against the user's budget. Returns the total and whether " +
        "it fits. ALWAYS call this before creating any PayPal order; never create an order that " +
        "exceeds the budget — swap for a cheaper compatible item instead.",
      parameters: z.object({
        budget: z.number(),
        items: z.array(
          z.object({
            title: z.string(),
            merchant: z.string(),
            price: z.number(),
            slot: z.string(),
          }),
        ),
      }),
      execute: async ({ budget, items }) => {
        const total = Number(items.reduce((s, i) => s + i.price, 0).toFixed(2));
        return {
          total,
          budget,
          withinBudget: total <= budget,
          overBy: total > budget ? Number((total - budget).toFixed(2)) : 0,
          byMerchant: items.reduce<Record<string, number>>((acc, i) => {
            acc[i.merchant] = Number(((acc[i.merchant] ?? 0) + i.price).toFixed(2));
            return acc;
          }, {}),
        };
      },
    }),

    present_outfit: tool({
      description:
        "Display the finalized, within-budget outfit to the user in the outfit panel. Call " +
        "this once you have a complete outfit that passes price_outfit, BEFORE asking for " +
        "payment approval. Include every item with its merchant, price, and slot.",
      parameters: z.object({
        budget: z.number(),
        currency: z.string().default("USD"),
        items: z.array(
          z.object({
            id: z.string(),
            title: z.string(),
            merchant: z.string(),
            price: z.number(),
            slot: z.string(),
            imageUrl: z.string().optional(),
            buyUrl: z.string().optional(),
          }),
        ),
      }),
      // Echo the outfit back so it streams to the UI, which lifts it into the outfit panel.
      execute: async ({ budget, currency, items }) => {
        const total = Number(items.reduce((s, i) => s + i.price, 0).toFixed(2));
        return { budget, currency, items, total, withinBudget: total <= budget };
      },
    }),

    capture_order: tool({
      description:
        "Capture a PayPal order AFTER the buyer has approved it in the UI. Only call this once " +
        "the user confirms they approved the payment.",
      parameters: z.object({ orderId: z.string() }),
      execute: async ({ orderId }) => {
        if (!hasPayPalCreds()) return { error: "PayPal not configured" };
        return captureOrder(orderId);
      },
    }),
  };

  return tools;
}

// PayPal Agent Toolkit tools (create_order / get_order) are loaded lazily so a missing
// dependency or creds never breaks the discovery-only path.
export async function buildPayPalToolkitTools(): Promise<Record<string, any>> {
  if (!hasPayPalCreds()) return {};
  try {
    const mod = await import("@paypal/agent-toolkit/ai-sdk");
    const toolkit = new mod.PayPalAgentToolkit({
      clientId: process.env.PAYPAL_CLIENT_ID!,
      clientSecret: process.env.PAYPAL_CLIENT_SECRET!,
      configuration: {
        actions: { orders: { create: true, get: true } },
        context: { sandbox: (process.env.PAYPAL_ENVIRONMENT ?? "SANDBOX") !== "PRODUCTION" },
      },
    });
    return toolkit.getTools();
  } catch (err) {
    console.error("[paypal-toolkit] unavailable, continuing without it:", err);
    return {};
  }
}
