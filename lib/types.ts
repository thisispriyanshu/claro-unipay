// Core domain types shared across the agent, clients, and UI.

export type Slot = "top" | "bottom" | "shoes" | "accessory" | "outer";

export interface Product {
  id: string;
  title: string;
  merchant: string;
  price: number;
  currency: string;
  imageUrl: string;
  buyUrl: string;
  category: string;
  tags: string[];
}

export interface OutfitItem {
  product: Product;
  slot: Slot;
}

export interface Outfit {
  items: OutfitItem[];
  total: number;
  budget: number;
  currency: string;
}

export type OrderStatus =
  | "draft"
  | "awaiting_approval"
  | "created"
  | "captured"
  | "settling"
  | "settled"
  | "failed";

export interface Payout {
  merchant: string;
  amount: number;
  currency: string;
  status: "pending" | "sent" | "failed";
  batchId?: string;
}

export interface Order {
  id: string;
  paypalOrderId?: string;
  status: OrderStatus;
  outfit: Outfit;
  payouts: Payout[];
}
