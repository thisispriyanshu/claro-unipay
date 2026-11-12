// Thin PayPal REST client for the pieces we drive directly:
//   - OAuth access token (client-credentials)
//   - create / capture order (full control for the demo checkout)
//   - Payouts (multi-merchant settlement — NOT provided by the Agent Toolkit)
//
// All sandbox by default. Secrets are read server-side only; never import this in a
// client component.

const BASE_URL = process.env.PAYPAL_BASE_URL ?? "https://api-m.sandbox.paypal.com";
const CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;

export function hasPayPalCreds(): boolean {
  return Boolean(CLIENT_ID && CLIENT_SECRET);
}

let cachedToken: { value: string; expiresAt: number } | null = null;

export async function getAccessToken(): Promise<string> {
  if (!hasPayPalCreds()) throw new Error("PayPal credentials are not configured");
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.value;
  }

  const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");
  const res = await fetch(`${BASE_URL}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`PayPal token failed: ${res.status} ${await res.text()}`);

  const data = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = {
    value: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
  return data.access_token;
}

async function ppFetch(path: string, init: RequestInit): Promise<any> {
  const token = await getAccessToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });
  const text = await res.text();
  const body = text ? JSON.parse(text) : {};
  if (!res.ok) {
    throw new Error(`PayPal ${path} failed: ${res.status} ${text}`);
  }
  return body;
}

export interface CreateOrderResult {
  id: string;
  status: string;
  approveUrl?: string;
}

export interface PurchaseUnit {
  referenceId: string;
  amount: number;
  payeeEmail: string;
  description?: string;
}

/**
 * Create a single order split across multiple merchants (one purchase_unit per payee).
 * At capture, PayPal routes each unit's amount to that payee — a real unified multi-merchant
 * checkout. (We use this instead of the Payouts API, which PayPal disables for some sender
 * countries, e.g. India.)
 */
export async function createOrder(
  units: PurchaseUnit[],
  currency = "USD",
): Promise<CreateOrderResult> {
  const body = await ppFetch("/v2/checkout/orders", {
    method: "POST",
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: units.map((u) => ({
        reference_id: u.referenceId,
        amount: { currency_code: currency, value: u.amount.toFixed(2) },
        payee: { email_address: u.payeeEmail },
        description: u.description,
      })),
    }),
  });
  const approveUrl = (body.links ?? []).find((l: any) => l.rel === "approve")?.href;
  return { id: body.id, status: body.status, approveUrl };
}

export interface CaptureUnit {
  referenceId: string;
  payee?: string;
  amount?: string;
  captureStatus?: string;
}

export interface CaptureResult {
  id: string;
  status: string;
  units: CaptureUnit[];
}

/** Capture an approved order; returns the per-merchant (per-unit) settlement breakdown. */
export async function captureOrder(orderId: string): Promise<CaptureResult> {
  const body = await ppFetch(`/v2/checkout/orders/${orderId}/capture`, { method: "POST" });
  const units: CaptureUnit[] = (body.purchase_units ?? []).map((pu: any) => {
    const cap = pu.payments?.captures?.[0];
    return {
      referenceId: pu.reference_id,
      payee: pu.payee?.email_address,
      amount: cap?.amount?.value,
      captureStatus: cap?.status,
    };
  });
  return { id: body.id, status: body.status, units };
}
