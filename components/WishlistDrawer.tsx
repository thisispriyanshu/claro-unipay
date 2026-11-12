"use client";

import { useStore } from "./store";
import Drawer from "./Drawer";
import { EmptyState } from "./CartDrawer";

export default function WishlistDrawer() {
  const { wishlist, drawer, openDrawer, toggleWishlist, addToCart } = useStore();

  return (
    <Drawer
      open={drawer === "wishlist"}
      onClose={() => openDrawer(null)}
      title="Wishlist"
      subtitle={wishlist.length ? `${wishlist.length} saved` : undefined}
    >
      {wishlist.length === 0 ? (
        <EmptyState label="No saved pieces yet." hint="Tap the ♡ on anything Claro shows you." />
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {wishlist.map((p) => (
            <div key={p.id} className="overflow-hidden rounded-xl border border-line bg-white shadow-card">
              <div className="aspect-[3/4] bg-sand">
                {p.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.imageUrl} alt={p.title} className="h-full w-full object-cover" />
                )}
              </div>
              <div className="space-y-1 p-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
                  {p.merchant}
                </p>
                <p className="line-clamp-1 text-xs text-ink">{p.title}</p>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-sm font-semibold text-ink">${p.price.toFixed(2)}</span>
                  <button
                    onClick={() => {
                      addToCart(p);
                      toggleWishlist(p);
                    }}
                    className="rounded-full bg-ink px-2.5 py-1 text-[11px] font-semibold text-cream hover:bg-cocoa"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Drawer>
  );
}
