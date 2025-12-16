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

const parseJwt = (token: string) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("Failed to parse JWT", e);
        return null;
    }
};

export const authService = {
  login: async (credentials: any) => {
    const response = await authApi.post('auth/login', credentials);
    const token = response.data.token;
    
    // Decode token to get user info
    const decoded = parseJwt(token);
    
    let user: User | null = null;
    if (decoded && decoded.prv) {
        user = {
            id: decoded.sub, // Mapping 'sub' to 'id' as requested
            name: decoded.prv.name,
            email: decoded.prv.email
        };
    } else {
        // Fallback or error handling if token structure is unexpected
        console.warn("Token structure unexpected, user info might be incomplete");
        // We might want to throw an error here, but for now let's return what we can
    }

    // Return structure expected by AuthResponse
    return {
        token: token,
        user: user
    };
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
