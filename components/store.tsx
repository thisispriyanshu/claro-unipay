"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { CartLine, ShopProduct } from "@/lib/shop";

type Drawer = "cart" | "wishlist" | null;

interface StoreValue {
  cart: CartLine[];
  wishlist: ShopProduct[];
  drawer: Drawer;
  openDrawer: (d: Drawer) => void;
  addToCart: (p: ShopProduct, qty?: number) => void;
  removeFromCart: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clearCart: () => void;
  toggleWishlist: (p: ShopProduct) => void;
  isWished: (id: string) => boolean;
  inCart: (id: string) => boolean;
  cartCount: number;
  subtotal: number;
}

const StoreContext = createContext<StoreValue | null>(null);

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore (private mode, quota) */
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [wishlist, setWishlist] = useState<ShopProduct[]>([]);
  const [drawer, setDrawer] = useState<Drawer>(null);

  // Hydrate from localStorage after mount (avoids SSR mismatch).
  useEffect(() => {
    setCart(load<CartLine[]>("claro.cart", []));
    setWishlist(load<ShopProduct[]>("claro.wishlist", []));
  }, []);

  useEffect(() => save("claro.cart", cart), [cart]);
  useEffect(() => save("claro.wishlist", wishlist), [wishlist]);

  const value = useMemo<StoreValue>(() => {
    const addToCart = (p: ShopProduct, qty = 1) =>
      setCart((c) => {
        const found = c.find((l) => l.id === p.id);
        if (found) return c.map((l) => (l.id === p.id ? { ...l, qty: l.qty + qty } : l));
        return [...c, { ...p, qty }];
      });

    return {
      cart,
      wishlist,
      drawer,
      openDrawer: setDrawer,
      addToCart,
      removeFromCart: (id) => setCart((c) => c.filter((l) => l.id !== id)),
      setQty: (id, qty) =>
        setCart((c) =>
          qty <= 0 ? c.filter((l) => l.id !== id) : c.map((l) => (l.id === id ? { ...l, qty } : l)),
        ),
      clearCart: () => setCart([]),
      toggleWishlist: (p) =>
        setWishlist((w) => (w.some((x) => x.id === p.id) ? w.filter((x) => x.id !== p.id) : [...w, p])),
      isWished: (id) => wishlist.some((x) => x.id === id),
      inCart: (id) => cart.some((l) => l.id === id),
      cartCount: cart.reduce((s, l) => s + l.qty, 0),
      subtotal: Number(cart.reduce((s, l) => s + l.price * l.qty, 0).toFixed(2)),
    };
  }, [cart, wishlist, drawer]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
