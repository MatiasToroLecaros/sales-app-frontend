interface Env {
    apiUrl: string;
    nodeEnv: string;
    isProduction: boolean;
    isDevelopment: boolean;
  }
  
  export const env: Env = {
    apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000',
    nodeEnv: import.meta.env.NODE_ENV || 'development',
    isProduction: import.meta.env.NODE_ENV === 'production',
    isDevelopment: import.meta.env.NODE_ENV === 'development',
  };