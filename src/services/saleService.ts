// src/services/saleService.ts
import { api } from './api';
import { Sale } from '../types/api';

export interface SaleFilters {
  startDate?: string;
  endDate?: string;
  productId?: number;
  userId?: number;
}

export const saleService = {
  async getAll(): Promise<Sale[]> {
    const { data } = await api.get<Sale[]>('/sales');
    return data;
  },

  async getFiltered(filters: SaleFilters): Promise<Sale[]> {
    const { data } = await api.get<Sale[]>('/sales', { params: filters });
    return data;
  },

  async getById(id: number): Promise<Sale> {
    const { data } = await api.get<Sale>(`/sales/${id}`);
    return data;
  },

  async create(sale: Omit<Sale, 'id'>): Promise<Sale> {
    const { data } = await api.post<Sale>('/sales', sale);
    return data;
  },

  async update(id: number, sale: Partial<Sale>): Promise<Sale> {
    const { data } = await api.put<Sale>(`/sales/${id}`, sale);
    return data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/sales/${id}`);
  },

  async getMetrics(): Promise<any> {
    const { data } = await api.get('/sales/metrics');
    return data;
  },
};