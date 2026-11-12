// Shared client-side product + cart shapes for the shopping experience.

export interface ShopProduct {
  id: string;
  title: string;
  merchant: string;
  price: number;
  currency: string;
  imageUrl?: string;
  buyUrl?: string;
  category?: string;
  slot?: string;
}

export interface CartLine extends ShopProduct {
  qty: number;
}

export interface MerchantGroup {
  merchant: string;
  lines: CartLine[];
  subtotal: number;
}

export function groupByMerchant(lines: CartLine[]): MerchantGroup[] {
  const map = new Map<string, CartLine[]>();
  for (const l of lines) {
    map.set(l.merchant, [...(map.get(l.merchant) ?? []), l]);
  }
  return [...map.entries()].map(([merchant, ls]) => ({
    merchant,
    lines: ls,
    subtotal: Number(ls.reduce((s, l) => s + l.price * l.qty, 0).toFixed(2)),
  }));
}
