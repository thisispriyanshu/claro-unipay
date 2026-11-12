"use client";

import { useState } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

interface LineItem {
  merchant: string;
  price: number; // total for this line (unit price × qty)
}

interface SplitEntry {
  receiver: string;
  amount: number;
  merchants: string[];
}

type Phase = "idle" | "settling" | "settled" | "error";

export default function PaymentButtons({
  lineItems,
  currency = "USD",
  onSettled,
}: {
  lineItems: LineItem[];
  currency?: string;
  onSettled?: () => void;
}) {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const merchantIds = (process.env.NEXT_PUBLIC_PAYPAL_MERCHANT_IDS ??
    "2AY38ZW9RL536,XCLG3AJY87NH4")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [split, setSplit] = useState<SplitEntry[]>([]);
  const [captureStatus, setCaptureStatus] = useState("");

  if (!clientId) {
    return (
      <p className="rounded-lg bg-amber-100 px-3 py-2 text-xs text-amber-800">
        Set NEXT_PUBLIC_PAYPAL_CLIENT_ID to enable checkout.
      </p>
    );
  }

  if (phase === "settled") {
    return (
      <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-sm">
        <p className="font-semibold text-emerald-800">● Paid — order {captureStatus}</p>
        <p className="mt-1 text-xs text-emerald-700/80">One checkout, split to each store:</p>
        <ul className="mt-2 space-y-1 text-xs text-cocoa">
          {split.map((s) => (
            <li key={s.receiver} className="flex justify-between gap-2">
              <span className="truncate">{s.merchants.join(", ")}</span>
              <span className="font-semibold">${s.amount.toFixed(2)}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div>
      {phase === "settling" && (
        <p className="mb-2 text-xs text-muted">Capturing payment and settling each store…</p>
      )}
      {error && <p className="mb-2 rounded-lg bg-red-100 px-3 py-2 text-xs text-red-700">{error}</p>}

      <PayPalScriptProvider
        options={{ clientId, currency, intent: "capture", merchantId: merchantIds }}
      >
        <PayPalButtons
          style={{ layout: "horizontal", color: "gold", label: "pay", height: 46, tagline: false }}
          disabled={phase === "settling" || lineItems.length === 0}
          createOrder={async () => {
            setError(null);
            try {
              const res = await fetch("/api/paypal/order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currency, items: lineItems }),
              });
              const data = (await res.json()) as { error?: string; id?: string; split?: SplitEntry[] };
              if (!res.ok) throw new Error(data.error ?? "Could not create PayPal order");
              if (!data.id) throw new Error("PayPal did not return an order ID");
              setSplit(data.split ?? []);
              return data.id;
            } catch (e) {
              const message = e instanceof TypeError
                ? "Could not reach Claro. Make sure the app server is running and try again."
                : e instanceof Error
                  ? e.message
                  : "Could not create PayPal order";
              setError(message);
              throw new Error(message);
            }
          }}
          onApprove={async (data) => {
            setPhase("settling");
            try {
              const res = await fetch("/api/paypal/capture", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId: data.orderID }),
              });
              const cap = await res.json();
              if (!res.ok) throw new Error(cap.error ?? "Capture failed");
              setCaptureStatus(cap.status);
              setPhase("settled");
              onSettled?.();
            } catch (e) {
              setError(e instanceof Error ? e.message : String(e));
              setPhase("error");
            }
          }}
          onError={(e) => {
            setError(String(e));
            setPhase("error");
          }}
        />
      </PayPalScriptProvider>
    </div>
  );
}
