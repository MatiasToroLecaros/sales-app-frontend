import { api } from './api';
import { Product } from '../types/api';

export const productService = {
  async getAll(): Promise<Product[]> {
    const { data } = await api.get<Product[]>('/products');
    return data;
  },

  async getById(id: number): Promise<Product> {
    const { data } = await api.get<Product>(`/products/${id}`);
    return data;
  },

  async create(product: Omit<Product, 'id'>): Promise<Product> {
    const { data } = await api.post<Product>('/products', product);
    return data;
  },

  async update(id: number, product: Partial<Product>): Promise<Product> {
    const { data } = await api.put<Product>(`/products/${id}`, product);
    return data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/products/${id}`);
  },
};