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

// Função especial para enviar formulário com arquivo PDF
export async function postFormDataWithFile<TReq extends Record<string, any>, TRes>(
  path: string,
  body: TReq,
  pdfFile?: File
): Promise<ApiResponse<TRes>> {
  const formData = new FormData();
  
  // Adicionar todos os campos do body ao formData
  Object.entries(body).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      formData.append(key, String(value));
    }
  });
  
  // Adicionar arquivo PDF se fornecido
  if (pdfFile) {
    formData.append('pdfFile', pdfFile);
    console.log(`📁 [Frontend] Adicionando arquivo PDF:`, pdfFile.name, `(${pdfFile.size} bytes)`);
  } else {
    console.log(`📁 [Frontend] Sem arquivo PDF para enviar`);
  }
  
  try {
    const token = localStorage.getItem('authToken');
    const { data } = await axios.post<ApiResponse<TRes>>(
      `${BASE_URL}${path}`,
      formData,
      {
        headers: {
          // NÃO definir Content-Type - deixar o navegador definir automaticamente com boundary
          'Authorization': token ? `Bearer ${token}` : undefined,
        }
      }
    );
    return data;
  } catch (error: any) {
    const msg = error?.response?.data?.message || error?.message || "Erro na requisição";
    if (error?.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    throw new Error(msg);
  }
}
