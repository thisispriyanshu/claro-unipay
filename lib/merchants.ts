// Maps the outfit's real-world merchants to our sandbox business receiver accounts.
//
// Channel3 returns real stores (Nike, Camper, …) that we obviously can't pay in a hackathon
// sandbox. So for the Payouts split we group the outfit by merchant, then deterministically
// assign each distinct merchant to one of the configured sandbox business accounts
// (DEMO_MERCHANT_EMAILS), cycling if there are more merchants than accounts. Each receiver
// gets the sum of its assigned merchants' item prices — a real, honest multi-party payout.

export interface OutfitLineItem {
  merchant: string;
  price: number;
}

export interface ResolvedPayout {
  receiver: string;
  amount: number;
  merchants: string[];
  note: string;
}

export function receiverEmails(): string[] {
  return (process.env.DEMO_MERCHANT_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);
}

export function splitToReceivers(items: OutfitLineItem[]): ResolvedPayout[] {
  const receivers = receiverEmails();
  if (receivers.length === 0) return [];

  // Sum per real merchant.
  const byMerchant = new Map<string, number>();
  for (const it of items) {
    byMerchant.set(it.merchant, Number(((byMerchant.get(it.merchant) ?? 0) + it.price).toFixed(2)));
  }

  // Assign each merchant to a receiver, round-robin and stable (sorted merchant order).
  const perReceiver = new Map<string, { amount: number; merchants: string[] }>();
  [...byMerchant.keys()].sort().forEach((merchant, i) => {
    const receiver = receivers[i % receivers.length];
    const entry = perReceiver.get(receiver) ?? { amount: 0, merchants: [] };
    entry.amount = Number((entry.amount + (byMerchant.get(merchant) ?? 0)).toFixed(2));
    entry.merchants.push(merchant);
    perReceiver.set(receiver, entry);
  });

  return [...perReceiver.entries()].map(([receiver, v]) => ({
    receiver,
    amount: v.amount,
    merchants: v.merchants,
    note: `Claro settlement for ${v.merchants.join(", ")}`,
  }));
}
