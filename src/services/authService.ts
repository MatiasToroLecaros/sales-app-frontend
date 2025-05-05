// src/services/authService.ts
import { api } from './api';
import { AuthResponse, LoginCredentials, RegisterData, User } from '../types/api';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/login', credentials);
    return data;
  },

  async register(userData: RegisterData): Promise<{ message: string }> {
    const { data } = await api.post<{ message: string }>('/auth/register', userData);
    return data;
  },

  async getProfile(): Promise<User> {
    const { data } = await api.get<User>('/users/profile');
    return data;
  },
};