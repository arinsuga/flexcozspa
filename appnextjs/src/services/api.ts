import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

export const AUTH_API_URL = process.env.NEXT_PUBLIC_AUTHAPIURL || 'http://authapi.localhost/';
export const APP_API_URL  = process.env.NEXT_PUBLIC_APPAPIURL  || 'http://appapi.localhost/';

console.log('AUTH_API_URL: ', AUTH_API_URL);
console.log('APP_API_URL: ', APP_API_URL);
console.log('process.env.NEXT_PUBLIC_AUTHAPIURL: ', process.env.NEXT_PUBLIC_AUTHAPIURL);
console.log('process.env.NEXT_PUBLIC_APPAPIURL: ', process.env.NEXT_PUBLIC_APPAPIURL);

const createApi = (baseURL: string): AxiosInstance => {
  const instance = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  instance.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      
      if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/login')) {
        originalRequest._retry = true;
        try {
           // Attempt refresh
           // Note: This assumes the refresh endpoint works with the existing invalid token or a separate refresh token/cookie
           // If utilizing a refresh token stored in localStorage:
           // const refreshToken = localStorage.getItem('refresh_token');
           
           // For now, we will try to call the refresh endpoint. 
           // If the API relies on HttpOnly cookies for refresh, this call is sufficient.
           // If it needs a payload, adjustment is needed.
           const { data } = await axios.post(`${AUTH_API_URL}auth/refresh`, {}, {
             headers: {
                Authorization: `Bearer ${localStorage.getItem('auth_token')}`
             }
           });
           
           if (data.access_token || data.token) {
             const newToken = data.access_token || data.token;
             localStorage.setItem('auth_token', newToken);
             originalRequest.headers.Authorization = `Bearer ${newToken}`;
             return instance(originalRequest);
           }
        } catch (refreshError) {
          localStorage.removeItem('auth_token');
          if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
             window.location.href = '/login';
          }
          return Promise.reject(refreshError);
        }
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

export const authApi = createApi(AUTH_API_URL);
export const appApi = createApi(APP_API_URL);
