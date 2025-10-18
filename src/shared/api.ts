import axios from "axios";

// Simple API helper using axios and VITE_API_URL
export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
};

const BASE_URL = "http://localhost:3000"; // process.env.VITE_API_URL || "http://localhost:3000";

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const msg = error?.response?.data?.message || error?.message || "Erro na requisição";
    
    // Se for erro 401 (não autorizado), limpar dados de autenticação
    if (error?.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      // Redirecionar para login se necessário
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(new Error(msg));
  }
);

export async function postJson<TReq, TRes>(path: string, body: TReq): Promise<ApiResponse<TRes>> {
  const { data } = await api.post<ApiResponse<TRes>>(path, body);
  return data;
}
