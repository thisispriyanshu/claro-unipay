"use client";

import { StoreProvider } from "@/components/store";
import Navbar from "@/components/Navbar";
import StylistChat from "@/components/StylistChat";
import CartDrawer from "@/components/CartDrawer";
import WishlistDrawer from "@/components/WishlistDrawer";

export default function Home() {
  return (
    <StoreProvider>
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 pb-16">
        {/* Editorial hero */}
        <section className="relative mt-4 overflow-hidden rounded-3xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/hero.jpg" alt="" className="h-64 w-full object-cover sm:h-80" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink/55 via-ink/20 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-10">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cream/80">
              Personal AI stylist
            </p>
            <h1 className="mt-2 max-w-xl font-serif text-3xl leading-tight text-cream sm:text-5xl">
              Dress for the moment.
              <br />
              I&apos;ll handle the rest.
            </h1>
            <p className="mt-3 max-w-md text-sm text-cream/90">
              Describe the occasion. Claro styles a full look from across every store — and checks
              you out in one payment.
            </p>
          </div>
        </section>

        {/* Stylist canvas */}
        <section className="relative z-10 mx-auto -mt-8 max-w-3xl">
          <div className="flex h-[72vh] min-h-[520px] flex-col rounded-3xl border border-line bg-cream/95 p-5 shadow-card backdrop-blur">
            <StylistChat />
          </div>
        </section>

        <p className="mt-6 text-center text-xs text-muted">
          Discovery by Channel3 · Payments by PayPal · one unified multi-store checkout
        </p>
      </main>

      <CartDrawer />
      <WishlistDrawer />
    </StoreProvider>
  );
}
