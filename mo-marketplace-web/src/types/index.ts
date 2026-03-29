export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface Variant {
  id: string;
  combinationKey: string;
  attributes: Record<string, string>;
  price: number;
  stock: number;
  sku?: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  basePrice: number;
  category?: string;
  imageUrl?: string;
  variants: Variant[];
  createdAt: string;
  updatedAt: string;
}

export interface QuickBuyResponse {
  success: boolean;
  message: string;
  variant: Variant;
}
