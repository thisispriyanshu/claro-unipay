"use client";

import { useState } from "react";
import { useStore } from "./store";
import ProductCard from "./ProductCard";
import OutfitGrid from "./OutfitGrid";
import PaymentButtons from "./PaymentButtons";
import type { ClientOutfit } from "@/lib/outfit";
import type { ShopProduct } from "@/lib/shop";

// Featured "the look" block the agent produces via present_outfit.
export default function OutfitShowcase({ outfit }: { outfit: ClientOutfit }) {
  const { addToCart, openDrawer } = useStore();
  const [approved, setApproved] = useState(false);

  const products: ShopProduct[] = outfit.items.map((i) => ({
    id: i.id,
    title: i.title,
    merchant: i.merchant,
    price: i.price,
    currency: outfit.currency,
    imageUrl: i.imageUrl,
    buyUrl: i.buyUrl,
    slot: i.slot,
  }));

  const over = !outfit.withinBudget;

  return (
    <div className="animate-in rounded-2xl border border-line bg-linen/50 p-4">
      <div className="mb-3 flex items-end justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-clay">The look</p>
          <h3 className="font-serif text-lg text-ink">
            {outfit.items.length} pieces · ${outfit.total.toFixed(2)}
          </h3>
        </div>
        <span
          className={
            "rounded-full px-2.5 py-1 text-xs font-semibold " +
            (over ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-800")
          }
        >
          {over
            ? `$${(outfit.total - outfit.budget).toFixed(2)} over`
            : `$${(outfit.budget - outfit.total).toFixed(2)} under budget`}
        </span>
      </div>

      <div className="no-scrollbar -mx-1 flex gap-3 overflow-x-auto px-1">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between text-xs text-muted">
          <span>Budget used</span>
          <span className="font-semibold text-ink">
            {Math.min(100, Math.round((outfit.total / outfit.budget) * 100))}%
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-sand">
          <div
            className={"h-full rounded-full transition-all " + (over ? "bg-red-500" : "bg-clay")}
            style={{ width: `${Math.min(100, (outfit.total / outfit.budget) * 100)}%` }}
          />
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-clay">
          Review before payment
        </p>
        <OutfitGrid items={outfit.items} />
      </div>

      {!approved ? (
        <button
          onClick={() => setApproved(true)}
          disabled={over}
          className="mt-4 w-full rounded-full bg-ink py-2.5 text-sm font-semibold text-cream transition hover:bg-cocoa disabled:cursor-not-allowed disabled:opacity-50"
        >
          {over ? "Choose a cheaper look first" : "Approve outfit & pay with PayPal"}
        </button>
      ) : (
        <div className="mt-4 rounded-xl border border-clay/30 bg-white p-3">
          <p className="mb-2 text-xs text-muted">
            Approved: one PayPal checkout for {outfit.items.length} pieces across {new Set(outfit.items.map((i) => i.merchant)).size} stores.
          </p>
          <PaymentButtons
            lineItems={products.map((p) => ({ merchant: p.merchant, price: p.price }))}
          />
        </div>
      )}

      <button
        onClick={() => {
          products.forEach((p) => addToCart(p));
          openDrawer("cart");
        }}
        className="mt-4 w-full rounded-full bg-clay py-2.5 text-sm font-semibold text-cream transition hover:bg-clayDark"
      >
        Add the whole look to cart
      </button>
    </div>
  );
}
