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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const msg = error?.response?.data?.message || error?.message || "Erro na requisição";
    return Promise.reject(new Error(msg));
  }
);

export async function postJson<TReq, TRes>(path: string, body: TReq): Promise<ApiResponse<TRes>> {
  const { data } = await api.post<ApiResponse<TRes>>(path, body);
  return data;
}
