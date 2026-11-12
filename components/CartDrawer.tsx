"use client";

import { useState } from "react";
import { useStore } from "./store";
import Drawer from "./Drawer";
import PaymentButtons from "./PaymentButtons";
import { groupByMerchant } from "@/lib/shop";

export default function CartDrawer() {
  const { cart, drawer, openDrawer, setQty, removeFromCart, clearCart, subtotal } = useStore();
  const [checkout, setCheckout] = useState(false);
  const groups = groupByMerchant(cart);
  const currency = cart[0]?.currency ?? "USD";

  const lineItems = cart.map((l) => ({ merchant: l.merchant, price: Number((l.price * l.qty).toFixed(2)) }));

  return (
    <Drawer
      open={drawer === "cart"}
      onClose={() => openDrawer(null)}
      title="Your cart"
      subtitle={groups.length > 1 ? `${groups.length} stores · one checkout` : undefined}
      footer={
        cart.length > 0 ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">Subtotal</span>
              <span className="font-serif text-xl text-ink">${subtotal.toFixed(2)}</span>
            </div>
            {!checkout ? (
              <button
                onClick={() => setCheckout(true)}
                className="w-full rounded-full bg-ink py-3 text-sm font-semibold text-cream transition hover:bg-cocoa"
              >
                Checkout — pay all stores at once
              </button>
            ) : (
              <PaymentButtons
                lineItems={lineItems}
                currency={currency}
                onSettled={() => {
                  clearCart();
                  setCheckout(false);
                }}
              />
            )}
            <p className="text-center text-[11px] text-muted">
              One PayPal payment, split to each store automatically.
            </p>
          </div>
        ) : null
      }
    >
      {cart.length === 0 ? (
        <EmptyState label="Your cart is empty." hint="Ask Claro to style a look, then add pieces here." />
      ) : (
        <div className="space-y-6">
          {groups.map((g) => (
            <div key={g.merchant}>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-clay">
                  {g.merchant}
                </span>
                <span className="text-xs text-muted">${g.subtotal.toFixed(2)}</span>
              </div>
              <div className="space-y-3">
                {g.lines.map((l) => (
                  <div key={l.id} className="flex gap-3">
                    <div className="h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-sand">
                      {l.imageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={l.imageUrl} alt={l.title} className="h-full w-full object-cover" />
                      )}
                    </div>
                    <div className="flex flex-1 flex-col">
                      <p className="line-clamp-2 text-sm text-ink">{l.title}</p>
                      <p className="mt-0.5 text-sm font-semibold text-ink">${l.price.toFixed(2)}</p>
                      <div className="mt-auto flex items-center gap-3">
                        <div className="flex items-center rounded-full border border-line">
                          <StepBtn onClick={() => setQty(l.id, l.qty - 1)}>−</StepBtn>
                          <span className="w-6 text-center text-sm">{l.qty}</span>
                          <StepBtn onClick={() => setQty(l.id, l.qty + 1)}>+</StepBtn>
                        </div>
                        <button
                          onClick={() => removeFromCart(l.id)}
                          className="text-xs text-muted underline-offset-2 hover:text-clay hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Drawer>
  );
}

function StepBtn({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} className="grid h-7 w-7 place-items-center text-muted hover:text-ink">
      {children}
    </button>
  );
}

export function EmptyState({ label, hint }: { label: string; hint: string }) {
  return (
    <div className="grid h-full place-items-center text-center">
      <div>
        <p className="font-serif text-lg text-ink">{label}</p>
        <p className="mt-1 text-sm text-muted">{hint}</p>
      </div>
    </div>
  );
}
