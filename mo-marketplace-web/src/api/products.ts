import api from './client';
import type { Product, QuickBuyResponse } from '../types';

export const productsApi = {
  getAll: () => api.get<Product[]>('/products').then((r) => r.data),

  getById: (id: string) =>
    api.get<Product>(`/products/${id}`).then((r) => r.data),

  create: (data: {
    name: string;
    description?: string;
    basePrice: number;
    category?: string;
    imageUrl?: string;
    variants?: {
      attributes: Record<string, string>;
      price: number;
      stock: number;
      sku?: string;
    }[];
  }) => api.post<Product>('/products', data).then((r) => r.data),

  update: (
    id: string,
    data: Partial<{
      name: string;
      description: string;
      basePrice: number;
      category: string;
      imageUrl: string;
    }>,
  ) => api.put<Product>(`/products/${id}`, data).then((r) => r.data),

  delete: (id: string) => api.delete(`/products/${id}`),

  addVariant: (
    productId: string,
    data: {
      attributes: Record<string, string>;
      price: number;
      stock: number;
      sku?: string;
    },
  ) => api.post(`/products/${productId}/variants`, data).then((r) => r.data),

  quickBuy: (productId: string, variantId: string, quantity: number) =>
    api
      .post<QuickBuyResponse>(`/products/${productId}/quick-buy`, {
        variantId,
        quantity,
      })
      .then((r) => r.data),
};
