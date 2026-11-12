// Client-side shape of the outfit the agent hands to the UI via the present_outfit tool.

export interface ClientOutfitItem {
  id: string;
  title: string;
  merchant: string;
  price: number;
  slot: string;
  imageUrl?: string;
  buyUrl?: string;
}

export interface ClientOutfit {
  budget: number;
  currency: string;
  items: ClientOutfitItem[];
  total: number;
  withinBudget: boolean;
}
