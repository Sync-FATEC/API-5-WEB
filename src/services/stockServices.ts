import { api, ApiResponse } from '@/shared/api';

export interface Stock {
  id: string;
  name: string;
  location: string;
  active: boolean;
}

export class StockServices {
  async listStock(userId: string): Promise<Stock[]> {
    try {
      const response = await api.get<ApiResponse<Stock[]>>(`/stocks/${userId}`);
      if (response.data.success && Array.isArray(response.data.data)) {
        return response.data.data as Stock[];
      }
      const fallbackMsg = response.data.message || 'Erro ao obter estoque';
      throw new Error(fallbackMsg);
    } catch (error: unknown) {
      console.error('Erro ao listar estoque:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro inesperado ao listar estoque';
      throw new Error(errorMessage);
    }
  }
}