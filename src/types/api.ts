// src/types/api.ts
export interface User {
    id: number;
    name: string;
    email: string;
  }
  
  export interface Product {
    id: number;
    name: string;
    description: string;
  }
  
  export interface Sale {
    id: number;
    productId: number;
    userId: number;
    quantity: number;
    unitPrice: number;
    date: string;
    product?: Product;
    user?: User;
  }
  
  export interface AuthResponse {
    access_token: string;
    user: User;
  }
  
  export interface LoginCredentials {
    email: string;
    password: string;
  }
  
  export interface RegisterData {
    name: string;
    email: string;
    password: string;
  }