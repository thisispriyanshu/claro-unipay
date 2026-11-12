"use client";

import { useState } from "react";
import { useStore } from "./store";
import type { ShopProduct } from "@/lib/shop";

export default function ProductCard({ product, compact = false }: { product: ShopProduct; compact?: boolean }) {
  const { addToCart, toggleWishlist, isWished, inCart } = useStore();
  const [imgOk, setImgOk] = useState(true);
  const wished = isWished(product.id);
  const added = inCart(product.id);

  return (
    <div className={(compact ? "w-[156px] " : "w-[180px] ") + "group shrink-0 overflow-hidden rounded-2xl border border-line bg-white shadow-card transition hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(42,35,32,0.10)]"}>
      <div className="relative aspect-[3/4] overflow-hidden bg-sand">
        {imgOk && product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.title}
            onError={() => setImgOk(false)}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center px-3 text-center text-xs text-muted">
            {product.title}
          </div>
        )}

        <button
          onClick={() => toggleWishlist(product)}
          aria-label={wished ? "Remove from wishlist" : "Save to wishlist"}
          className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-base shadow-sm backdrop-blur transition hover:scale-110"
        >
          <span className={wished ? "text-clay" : "text-muted"}>{wished ? "♥" : "♡"}</span>
        </button>
      </div>

      <div className={(compact ? "space-y-1 p-2.5 " : "space-y-1 p-3 ")}>
        <p className="truncate text-[10px] font-semibold uppercase tracking-wider text-muted">
          {product.merchant}
        </p>
        <p className="line-clamp-2 min-h-[2.4em] text-[13px] leading-snug text-ink">
          {product.title}
        </p>
        <div className="flex items-center justify-between pt-1">
          <span className="font-serif text-base font-semibold text-ink">
            ${product.price.toFixed(2)}
          </span>
          <button
            onClick={() => addToCart(product)}
            className={
              "rounded-full px-3 py-1 text-xs font-semibold transition " +
              (added
                ? "bg-sand text-cocoa hover:bg-linen"
                : "bg-ink text-cream hover:bg-cocoa")
            }
          >
            {added ? "Added ✓" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}
