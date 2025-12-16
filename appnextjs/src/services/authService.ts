import { authApi } from './api';

export interface User {
  id: string | number;
  name: string;
  email: string;
  // Add other user fields as needed
}

export interface AuthResponse {
  token: string;
  user: User;
  expires_in?: number;
}

export const authService = {
  login: async (credentials: any) => {
    const response = await authApi.post('auth/login', credentials);
    return response.data;
  },

  logout: async () => {
    try {
      await authApi.post('auth/logout');
    } finally {
      localStorage.removeItem('auth_token');
    }
  },

  register: async (data: any) => {
    const response = await authApi.post('auth/register', data);
    return response.data;
  },

  me: async () => {
    const response = await authApi.get('auth/me');
    return response.data;
  },

  refresh: async () => {
    const response = await authApi.post('auth/refresh');
    return response.data;
  },
  
  status: async () => {
    const response = await authApi.get('auth/status');
    return response.data;
  }
};
