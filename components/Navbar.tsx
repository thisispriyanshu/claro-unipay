"use client";

import { useStore } from "./store";

export default function Navbar() {
  const { cartCount, wishlist, openDrawer } = useStore();

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-cream/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5">
        <div className="flex items-baseline gap-2">
          <span className="font-serif text-2xl font-semibold tracking-tight text-ink">Claro</span>
          <span className="hidden text-xs uppercase tracking-[0.2em] text-muted sm:inline">
            AI stylist · every store · one checkout
          </span>
        </div>

        <div className="flex items-center gap-1">
          <IconButton label="Wishlist" count={wishlist.length} onClick={() => openDrawer("wishlist")}>
            ♡
          </IconButton>
          <IconButton label="Cart" count={cartCount} onClick={() => openDrawer("cart")}>
            🛍
          </IconButton>
        </div>
      </div>
    </header>
  );
}

function IconButton({
  children,
  count,
  label,
  onClick,
}: {
  children: React.ReactNode;
  count: number;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="relative grid h-10 w-10 place-items-center rounded-full text-lg transition hover:bg-sand"
    >
      {children}
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-[20px] place-items-center rounded-full bg-clay px-1 text-[11px] font-semibold text-cream">
          {count}
        </span>
      )}
    </button>
  );
}
