// Channel3 product-discovery client with a typed mock fallback.
//
// Live API (confirmed against docs.trychannel3.com):
//   POST https://api.trychannel3.com/v1/search
//   headers: x-api-key: <key>   (optional x-user-id for click attribution)
//   body:   { query, filters: { price: {min_price,max_price}, availability:["InStock"], category }, limit }
//
// If CHANNEL3_API_KEY is unset the app serves realistic mock products so the UI and agent
// loop are demoable before the key is wired. The response-field mapping lives in
// `mapChannel3Product` — the one place to adjust if a live field name differs.

import type { Product } from "./types";

export interface SearchParams {
  query: string;
  category?: string;
  maxPrice?: number;
  minPrice?: number;
  limit?: number;
  /** Optional end-user id for Channel3 click/commission attribution. */
  userId?: string;
}

const BASE_URL = process.env.CHANNEL3_BASE_URL ?? "https://api.trychannel3.com";
const API_KEY = process.env.CHANNEL3_API_KEY;

export async function searchProducts(params: SearchParams): Promise<Product[]> {
  if (!API_KEY) {
    return mockSearch(params);
  }

  try {
    // NOTE: the live API only accepts `price` and `availability` under `filters` — a
    // `category` filter returns 422. We steer category through the query text instead.
    const filters: Record<string, unknown> = { availability: ["InStock"] };
    if (params.minPrice != null || params.maxPrice != null) {
      filters.price = {
        ...(params.minPrice != null ? { min_price: params.minPrice } : {}),
        ...(params.maxPrice != null ? { max_price: params.maxPrice } : {}),
      };
    }

    const headers = {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
      ...(params.userId ? { "x-user-id": params.userId } : {}),
    };
    const limit = params.limit ?? 12;

    let res = await fetch(`${BASE_URL}/v1/search`, {
      method: "POST",
      headers,
      body: JSON.stringify({ query: params.query, filters, limit }),
      cache: "no-store",
    });

    // If a filter is ever rejected, degrade to a plain query rather than losing all results.
    if (res.status === 422) {
      res = await fetch(`${BASE_URL}/v1/search`, {
        method: "POST",
        headers,
        body: JSON.stringify({ query: params.query, limit }),
        cache: "no-store",
      });
    }

    if (!res.ok) {
      throw new Error(`Channel3 search failed: ${res.status} ${await res.text()}`);
    }

    const data: unknown = await res.json();
    // Channel3 may return a bare array or an object wrapping the results — handle both.
    const rows: unknown[] = Array.isArray(data)
      ? data
      : Array.isArray((data as any)?.results)
        ? (data as any).results
        : Array.isArray((data as any)?.products)
          ? (data as any).products
          : [];

    return rows
      .map(mapChannel3Product)
      .filter((p): p is Product => p !== null)
      .filter((p) => (params.maxPrice ? p.price <= params.maxPrice : true));
  } catch (err) {
    console.error("[channel3] falling back to mock:", err);
    return mockSearch(params);
  }
}

// Maps the live Channel3 product shape (confirmed against the API):
//   { id, title, brands:[{name}], images:[{url,is_main_image}], category,
//     colors:[], offers:[{ url, domain, price:{price,currency}, availability }] }
// Defensive fallbacks remain so a minor variation doesn't drop a product.
function mapChannel3Product(raw: unknown): Product | null {
  if (typeof raw !== "object" || raw === null) return null;
  const r = raw as Record<string, any>;

  const offer = Array.isArray(r.offers) && r.offers.length ? r.offers[0] : undefined;
  const price = Number(offer?.price?.price ?? r.price?.price ?? r.price ?? NaN);
  if (!r.id || Number.isNaN(price)) return null;

  const mainImage =
    (Array.isArray(r.images) && (r.images.find((i: any) => i?.is_main_image) ?? r.images[0]))?.url ??
    r.image_url ??
    "";

  const colors = Array.isArray(r.colors) ? r.colors.map(String) : [];
  const features = Array.isArray(r.key_features) ? r.key_features.map(String) : [];

  return {
    id: String(r.id),
    title: String(r.title ?? r.name ?? "Untitled"),
    merchant: String(r.brands?.[0]?.name ?? offer?.domain ?? r.brand ?? "Unknown"),
    price,
    currency: String(offer?.price?.currency ?? r.currency ?? "USD"),
    imageUrl: String(mainImage),
    buyUrl: String(offer?.url ?? r.url ?? ""),
    category: String(r.category ?? ""),
    tags: [...colors, ...features].slice(0, 8),
  };
}

// ---- Mock catalog (used until a Channel3 key is set) ------------------------------------

const MOCK: Product[] = [
  m("tp1", "Linen Blend Button Shirt", "Everlane", 68, "top", ["earthy", "autumn", "linen"]),
  m("tp2", "Merino Knit Polo", "COS", 95, "top", ["earthy", "smart-casual"]),
  m("tp3", "Oxford Cotton Shirt", "Uniqlo", 39, "top", ["classic", "budget"]),
  m("bt1", "Tapered Wool Trousers", "Banana Republic", 110, "bottom", ["earthy", "autumn"]),
  m("bt2", "Stretch Chino", "Bonobos", 79, "bottom", ["smart-casual", "budget"]),
  m("sh1", "Suede Chelsea Boots", "Thursday", 140, "shoes", ["earthy", "autumn", "boots"]),
  m("sh2", "Leather Derby Shoes", "Clarks", 99, "shoes", ["classic", "formal"]),
  m("ac1", "Knit Silk Tie", "The Tie Bar", 25, "accessory", ["earthy", "formal"]),
  m("ac2", "Leather Belt", "Anson", 45, "accessory", ["classic"]),
  m("ou1", "Unstructured Wool Blazer", "Suitsupply", 199, "outer", ["autumn", "formal"]),
];

function m(
  id: string,
  title: string,
  merchant: string,
  price: number,
  category: string,
  tags: string[],
): Product {
  return {
    id,
    title,
    merchant,
    price,
    currency: "USD",
    imageUrl: `https://placehold.co/400x500?text=${encodeURIComponent(title)}`,
    buyUrl: "https://example.com",
    category,
    tags,
  };
}

function mockSearch(params: SearchParams): Product[] {
  const q = params.query.toLowerCase();
  let results = MOCK.filter((p) => {
    if (params.category && p.category !== params.category) return false;
    if (params.maxPrice && p.price > params.maxPrice) return false;
    if (params.minPrice && p.price < params.minPrice) return false;
    return true;
  });
  const words = q.split(/\s+/).filter(Boolean);
  results = results
    .map((p) => ({
      p,
      score: words.reduce(
        (s, w) =>
          s + (p.tags.some((t) => t.includes(w)) ? 2 : 0) + (p.title.toLowerCase().includes(w) ? 1 : 0),
        0,
      ),
    }))
    .sort((a, b) => b.score - a.score)
    .map((x) => x.p);
  return results.slice(0, params.limit ?? 12);
}
