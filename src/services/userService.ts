// src/services/userService.ts
import { api } from './api';
import { User } from '../types/api';

export const userService = {
  async getAll(): Promise<User[]> {
    const { data } = await api.get<User[]>('/users');
    return data;
  },

  async getById(id: number): Promise<User> {
    const { data } = await api.get<User>(`/users/${id}`);
    return data;
  },

  async getProfile(): Promise<User> {
    const { data } = await api.get<User>('/users/profile');
    return data;
  },

  async update(id: number, user: Partial<User>): Promise<User> {
    const { data } = await api.patch<User>(`/users/${id}`, user);
    return data;
  },
};