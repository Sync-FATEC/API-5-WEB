import { api, ApiResponse } from '@/shared/api';

export type EmailTemplate = {
  id: string;
  type: string;
  subject: string;
  html: string;
  footer?: string;
  updatedAt: string;
};

export type PreviewResponse = {
  subject: string;
  html: string;
  missing: string[];
};

export class EmailTemplatesService {
  async getAllowedVars(): Promise<string[]> {
    const res = await api.get<ApiResponse<string[]>>('/email-templates/allowed-vars');
    if (res.data.success && res.data.data) return res.data.data;
    throw new Error(res.data.message || 'Erro ao buscar variáveis permitidas');
  }

  async listTemplates(): Promise<EmailTemplate[]> {
    const res = await api.get<ApiResponse<EmailTemplate[]>>('/email-templates');
    if (res.data.success && res.data.data) return res.data.data;
    throw new Error(res.data.message || 'Erro ao listar templates');
  }

  async getTemplate(id: string): Promise<EmailTemplate> {
    const res = await api.get<ApiResponse<EmailTemplate>>(`/email-templates/${id}`);
    if (res.data.success && res.data.data) return res.data.data;
    throw new Error(res.data.message || 'Erro ao obter template');
  }

  async createTemplate(payload: { name: string; subject: string; html: string; }): Promise<EmailTemplate> {
    const res = await api.post<ApiResponse<EmailTemplate>>('/email-templates', payload);
    if (res.data.success && res.data.data) return res.data.data;
    throw new Error(res.data.message || 'Erro ao criar template');
  }

  async updateTemplate(id: string, payload: { subject?: string; html?: string; footer?: string; }): Promise<EmailTemplate> {
    const res = await api.patch<ApiResponse<EmailTemplate>>(`/email-templates/${id}`, payload);
    if (res.data.success && res.data.data) return res.data.data;
    throw new Error(res.data.message || 'Erro ao atualizar template');
  }

  async autosaveTemplate(id: string, payload: { subject?: string; html?: string; footer?: string; }): Promise<EmailTemplate> {
    const res = await api.patch<ApiResponse<EmailTemplate>>(`/email-templates/${id}/autosave`, payload);
    if (res.data.success && res.data.data) return res.data.data;
    throw new Error(res.data.message || 'Erro no autosave do template');
  }

  async previewTemplate(id: string, vars: Record<string, string>): Promise<PreviewResponse> {
    const res = await api.post<ApiResponse<PreviewResponse>>(`/email-templates/${id}/preview`, { vars });
    if (res.data.success && res.data.data) return res.data.data;
    throw new Error(res.data.message || 'Erro ao gerar preview');
  }

  async versions(id: string): Promise<any[]> {
    const res = await api.get<ApiResponse<any[]>>(`/email-templates/${id}/versions`);
    if (res.data.success && res.data.data) return res.data.data;
    throw new Error(res.data.message || 'Erro ao listar versões');
  }

  async restore(id: string, versionId: string): Promise<EmailTemplate> {
    const res = await api.post<ApiResponse<EmailTemplate>>(`/email-templates/${id}/restore/${versionId}`);
    if (res.data.success && res.data.data) return res.data.data;
    throw new Error(res.data.message || 'Erro ao restaurar versão');
  }
}