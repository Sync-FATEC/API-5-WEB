import { api, ApiResponse } from '@/shared/api';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  firebaseUid?: string;
  createdAt?: string;
}

export interface LoginResponse {
  user: AuthUser;
  token?: string;
}

export class AuthService {
  // Login usando backend (que usa Firebase internamente)
  async signIn(email: string, password: string): Promise<AuthUser> {
    try {
      const response = await api.post<ApiResponse<LoginResponse>>('/auth/login', {
        email,
        password
      });

      if (response.data.success && response.data.data) {
        const userData = response.data.data.user;
        
        // Salvar dados do usuário no localStorage
        localStorage.setItem('userData', JSON.stringify(userData));
        if (response.data.data.token) {
          localStorage.setItem('authToken', response.data.data.token);
        }
        
        return userData;
      } else {
        throw new Error(response.data.message || 'Erro ao fazer login');
      }
    } catch (error: unknown) {
      console.error('Erro ao fazer login:', error);
      
      // Tratar diferentes tipos de erro
      if (error && typeof error === 'object' && 'response' in error) {
        // Erro da API
        const apiError = error as { response: { data?: { message?: string } } };
        const message = apiError.response.data?.message || 'Erro no servidor';
        throw new Error(message);
      } else if (error && typeof error === 'object' && 'request' in error) {
        // Erro de rede
        throw new Error('Erro de conexão. Verifique sua internet e se o servidor está rodando.');
      } else {
        // Outros erros
        const errorMessage = error instanceof Error ? error.message : 'Erro inesperado';
        throw new Error(errorMessage);
      }
    }
  }

  // Logout
  async signOut(): Promise<void> {
    try {
      // Limpar dados locais
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      
      // Aqui você pode adicionar uma chamada para o backend se necessário
      // await api.post('/api/users/logout');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      // Mesmo com erro, limpar dados locais
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
    }
  }

  // Verificar se o usuário está logado
  getCurrentUser(): AuthUser | null {
    try {
      const userData = localStorage.getItem('userData');
      const token = localStorage.getItem('authToken');
      
      if (userData && token) {
        return JSON.parse(userData);
      }
      return null;
    } catch (error) {
      console.error('Erro ao recuperar dados do usuário:', error);
      // Se houver erro, limpar dados corrompidos
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      return null;
    }
  }

  // Verificar se tem token válido
  hasValidToken(): boolean {
    const token = localStorage.getItem('authToken');
    return !!token;
  }

  // Recuperar token para requisições autenticadas
  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  // Verificar dados do usuário via API (opcional)
  async validateUser(email: string): Promise<AuthUser> {
    try {
      const response = await api.get<ApiResponse<AuthUser>>(`/api/users/${email}`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error('Usuário não encontrado');
      }
    } catch (error: unknown) {
      console.error('Erro ao validar usuário:', error);
      const errorMessage = error && typeof error === 'object' && 'response' in error 
        ? (error as { response: { data?: { message?: string } } }).response.data?.message || 'Erro ao validar usuário'
        : 'Erro ao validar usuário';
      throw new Error(errorMessage);
    }
  }
}