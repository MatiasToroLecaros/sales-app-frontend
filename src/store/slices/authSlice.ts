import { User } from '../../types/api';

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthSlice extends AuthState {
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setError: (error: string | null) => void;
  setLoading: (isLoading: boolean) => void;
  login: (token: string, user: User) => void;
  logout: () => void;
}

export const createAuthSlice = (set: any) => ({
  // Estado inicial
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
  error: null,

  // Acciones
  setUser: (user: User | null) => set({ user }),
  setToken: (token: string | null) => set({ token }),
  setError: (error: string | null) => set({ error }),
  setLoading: (isLoading: boolean) => set({ isLoading }),
  
  login: (token: string, user: User) => {
    localStorage.setItem('token', token);
    set({ 
      token, 
      user, 
      isAuthenticated: true, 
      error: null 
    });
  },
  
  logout: () => {
    localStorage.removeItem('token');
    set({ 
      token: null, 
      user: null, 
      isAuthenticated: false 
    });
  },
});