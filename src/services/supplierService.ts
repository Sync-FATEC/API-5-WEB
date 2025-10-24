import { api, ApiResponse } from "@/shared/api";

export type Supplier = {
  id: string;
  razaoSocial: string;
  nomeResponsavel?: string;
  cargoResponsavel?: string;
  cnpj: string;
  emailPrimario: string;
  emailSecundario?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type SupplierListResponse = {
  suppliers: Supplier[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export class SupplierService {
  async listSuppliers(params?: {
    search?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
    sortBy?: "razaoSocial" | "cnpj" | "createdAt";
    sortOrder?: "ASC" | "DESC";
  }): Promise<Supplier[]> {
    const queryParams = new URLSearchParams();
    
    if (params?.search) queryParams.append("search", params.search);
    if (params?.isActive !== undefined) queryParams.append("isActive", String(params.isActive));
    if (params?.page) queryParams.append("page", String(params.page));
    if (params?.limit) queryParams.append("limit", String(params.limit));
    if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);

    const url = `/suppliers${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    const response = await api.get<ApiResponse<SupplierListResponse>>(url);
    
    if (response.data.success && response.data.data) {
      return response.data.data.suppliers;
    }
    
    throw new Error(response.data.message || "Erro ao listar fornecedores");
  }

  async getSupplierById(id: string): Promise<Supplier> {
    const response = await api.get<ApiResponse<Supplier>>(`/suppliers/${id}`);
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || "Erro ao buscar fornecedor");
  }

  async updateSupplier(id: string, data: Partial<Supplier>): Promise<Supplier> {
    const response = await api.put<ApiResponse<Supplier>>(`/suppliers/${id}`, data);
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || "Erro ao atualizar fornecedor");
  }

  async deleteSupplier(id: string): Promise<void> {
    const response = await api.delete<ApiResponse<void>>(`/suppliers/${id}`);
    
    if (!response.data.success) {
      throw new Error(response.data.message || "Erro ao deletar fornecedor");
    }
  }
}
