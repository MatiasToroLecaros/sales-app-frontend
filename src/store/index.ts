import { create } from 'zustand';
import { createAuthSlice, AuthSlice } from './slices/authSlice';

// Tipo del store completo
export type StoreState = AuthSlice;

// Crear el store
export const useStore = create<StoreState>((set) => ({
  ...createAuthSlice(set),
}));