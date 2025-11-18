import { api, ApiResponse } from "@/shared/api";

export type Urgencia = string; // pode ser texto livre (ex.: "ALTA", "MEDIA")

export interface CommitmentNote {
  id: string;
  supplierId: string;
  valor: number;
  numeroNota: string;
  dataNota: string; // YYYY-MM-DD
  ug: string;
  razaoSocial: string;
  cnpj: string;
  nomeResponsavelExtraido?: string;
  nomeResponsavelManual?: string;
  cargoResponsavel?: string;
  frequenciaCobrancaDias?: number; // default 15
  urgencia?: Urgencia;
  dataPrevistaEntrega?: string; // YYYY-MM-DD (default agora + 30 dias no backend)
  diasRestantesEntrega: number;
  diasAtraso: number;
  atrasado: boolean;
  nomeResponsavelManualOverride: boolean;
  createdAt: string;
  supplier?: {
    id: string;
    razaoSocial: string;
    cnpj: string;
  };
  // Campos administrativos
  processoAdm?: boolean;
  materialRecebido?: boolean;
  nfEntregueNoAlmox?: boolean;
  justificativaMais60Dias?: string;
  enviadoParaLiquidar?: boolean;
  // Finalização
  finalizada?: boolean;
  dataFinalizacao?: string | null;
}

export interface CreateCommitmentNoteDto {
  supplierId: string;
  valor: number;
  numeroNota: string;
  dataNota: string; // YYYY-MM-DD
  ug: string;
  razaoSocial: string;
  cnpj: string;
  nomeResponsavelExtraido?: string;
  nomeResponsavelManual?: string;
  cargoResponsavel?: string;
  frequenciaCobrancaDias?: number; // default 15
  urgencia?: Urgencia;
  dataPrevistaEntrega?: string; // default now + 30 days (handled by backend)
}

export interface UpdateCommitmentNoteDto {
  nomeResponsavelManual?: string;
  cargoResponsavel?: string;
  frequenciaCobrancaDias?: number;
  urgencia?: Urgencia;
  dataPrevistaEntrega?: string;
  isActive?: boolean;
}

// DTO para atualização de campos administrativos
export interface UpdateAdminFieldsDto {
  processoAdm?: boolean;
  materialRecebido?: boolean;
  nfEntregueNoAlmox?: boolean;
  justificativaMais60Dias?: string;
  enviadoParaLiquidar?: boolean;
}

export class CommitmentNotesService {
  async list(): Promise<CommitmentNote[]> {
    const response = await api.get<ApiResponse<CommitmentNote[]>>(`/commitment-notes`);
    if (response.data.success && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    throw new Error(response.data.message || "Erro ao listar notas de empenho");
  }

  async getById(id: string): Promise<CommitmentNote> {
    const response = await api.get<ApiResponse<CommitmentNote>>(`/commitment-notes/${id}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || "Erro ao obter detalhes da nota de empenho");
  }

  async create(data: CreateCommitmentNoteDto): Promise<CommitmentNote> {
    const response = await api.post<ApiResponse<CommitmentNote>>(`/commitment-notes`, data);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || "Erro ao criar nota de empenho");
  }

  async update(id: string, data: UpdateCommitmentNoteDto): Promise<CommitmentNote> {
    const response = await api.put<ApiResponse<CommitmentNote>>(`/commitment-notes/${id}`, data);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || "Erro ao atualizar nota de empenho");
  }

  async updateAdminFields(id: string, data: UpdateAdminFieldsDto): Promise<CommitmentNote> {
    const response = await api.patch<ApiResponse<CommitmentNote>>(`/commitment-notes/${id}/admin-fields`, data);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || "Erro ao atualizar campos administrativos");
  }

  async finalize(id: string): Promise<CommitmentNote> {
    const response = await api.post<ApiResponse<CommitmentNote>>(`/commitment-notes/${id}/finalize`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || "Erro ao finalizar nota de empenho");
  }

  async remove(id: string): Promise<void> {
    const response = await api.delete<ApiResponse<void>>(`/commitment-notes/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.message || "Erro ao remover nota de empenho");
    }
  }
}