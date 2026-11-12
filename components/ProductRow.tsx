"use client";

import { useState } from "react";
import ProductCard from "./ProductCard";
import type { ShopProduct } from "@/lib/shop";

// Horizontal, swipeable row of product cards — used to render the stylist's search results.
export default function ProductRow({ products }: { products: ShopProduct[] }) {
  const [showAll, setShowAll] = useState(false);
  if (!products.length) return null;
  const visibleProducts = showAll ? products : products.slice(0, 3);

  return (
    <div className="rounded-xl border border-line bg-linen/50 p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-muted">
          <strong className="font-semibold text-ink">{products.length} pieces found</strong>
          <span className="ml-1">to consider</span>
        </p>
        {products.length > 3 && (
          <button
            type="button"
            onClick={() => setShowAll((value) => !value)}
            className="shrink-0 text-xs font-semibold text-clay underline-offset-2 hover:underline"
          >
            {showAll ? "Show less" : `Show ${products.length - 3} more`}
          </button>
        )}
      </div>
      <div className="no-scrollbar mt-3 flex gap-3 overflow-x-auto px-1 pb-1">
        {visibleProducts.map((p) => (
          <ProductCard key={p.id} product={p} compact />
        ))}
      </div>
    </div>
  );
}
