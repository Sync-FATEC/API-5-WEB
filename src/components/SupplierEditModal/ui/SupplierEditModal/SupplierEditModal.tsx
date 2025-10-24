import { FC, FormEvent, useState, useEffect } from "react";
import { api } from "@/shared/api";
import { Supplier } from "@/services/supplierService";

type SupplierFormData = {
  razaoSocial: string;
  nomeResponsavel: string;
  cargoResponsavel: string;
  cnpj: string;
  emailPrimario: string;
  emailSecundario: string;
  isActive: boolean;
};

type Props = {
  supplier: Supplier;
  isOpen: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
};

const formatCNPJ = (value: string): string => {
  // Remove tudo que não é dígito
  const numbers = value.replace(/\D/g, '');
  
  // Limita a 14 dígitos
  const limited = numbers.slice(0, 14);
  
  // Aplica a máscara XX.XXX.XXX/XXXX-XX
  if (limited.length <= 2) return limited;
  if (limited.length <= 5) return `${limited.slice(0, 2)}.${limited.slice(2)}`;
  if (limited.length <= 8) return `${limited.slice(0, 2)}.${limited.slice(2, 5)}.${limited.slice(5)}`;
  if (limited.length <= 12) return `${limited.slice(0, 2)}.${limited.slice(2, 5)}.${limited.slice(5, 8)}/${limited.slice(8)}`;
  return `${limited.slice(0, 2)}.${limited.slice(2, 5)}.${limited.slice(5, 8)}/${limited.slice(8, 12)}-${limited.slice(12)}`;
};

export const SupplierEditModal: FC<Props> = ({ supplier, isOpen, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState<SupplierFormData>({
    razaoSocial: "",
    nomeResponsavel: "",
    cargoResponsavel: "",
    cnpj: "",
    emailPrimario: "",
    emailSecundario: "",
    isActive: true,
  });
  const [errors, setErrors] = useState<{
    razaoSocial?: string;
    cnpj?: string;
    emailPrimario?: string;
    emailSecundario?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>("");

  useEffect(() => {
    if (supplier) {
      setFormData({
        razaoSocial: supplier.razaoSocial || "",
        nomeResponsavel: supplier.nomeResponsavel || "",
        cargoResponsavel: supplier.cargoResponsavel || "",
        cnpj: supplier.cnpj || "",
        emailPrimario: supplier.emailPrimario || "",
        emailSecundario: supplier.emailSecundario || "",
        isActive: supplier.isActive ?? true,
      });
    }
  }, [supplier]);

  const validate = (): boolean => {
    const newErrors: {
      razaoSocial?: string;
      cnpj?: string;
      emailPrimario?: string;
      emailSecundario?: string;
    } = {};

    if (!formData.razaoSocial.trim()) {
      newErrors.razaoSocial = "Razão Social é obrigatória";
    }

    if (!formData.cnpj.trim()) {
      newErrors.cnpj = "CNPJ é obrigatório";
    } else if (!/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(formData.cnpj) && !/^\d{14}$/.test(formData.cnpj)) {
      newErrors.cnpj = "CNPJ inválido (use XX.XXX.XXX/XXXX-XX ou 14 dígitos)";
    }

    if (!formData.emailPrimario.trim()) {
      newErrors.emailPrimario = "Email primário é obrigatório";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailPrimario)) {
      newErrors.emailPrimario = "Email inválido";
    }

    if (formData.emailSecundario.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailSecundario)) {
      newErrors.emailSecundario = "Email inválido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    setErrors({});

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await api.put(`/suppliers/${supplier.id}`, {
        ...formData,
        emailPrimario: formData.emailPrimario.toLowerCase(),
        emailSecundario: formData.emailSecundario ? formData.emailSecundario.toLowerCase() : undefined,
      });
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error("Erro completo:", error);
      console.error("error.response:", error?.response);
      console.error("error.response.data:", error?.response?.data);
      
      // Tentar pegar a mensagem de erro do backend em diferentes locais
      let errorMessage = "Erro ao atualizar fornecedor";
      
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error?.response?.data) {
        // Se data for string
        errorMessage = typeof error.response.data === 'string' 
          ? error.response.data 
          : JSON.stringify(error.response.data);
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      // Tratar erros específicos
      if (errorMessage.toLowerCase().includes("cnpj inválido") || 
          errorMessage.toLowerCase().includes("cnpj invalido")) {
        errorMessage = "⚠️ CNPJ inválido. Verifique se o número está correto e tente novamente.";
      } else if (errorMessage.toLowerCase().includes("cnpj já cadastrado") || 
                 errorMessage.toLowerCase().includes("cnpj ja cadastrado")) {
        errorMessage = "⚠️ Este CNPJ já está cadastrado em outro fornecedor.";
      } else if (errorMessage.toLowerCase().includes("email primário inválido") ||
                 errorMessage.toLowerCase().includes("email primario invalido") ||
                 errorMessage.toLowerCase().includes("email inválido") ||
                 errorMessage.toLowerCase().includes("email invalido")) {
        errorMessage = "⚠️ Email primário inválido. Verifique o formato do email.";
      } else if (errorMessage.toLowerCase().includes("email secundário inválido") ||
                 errorMessage.toLowerCase().includes("email secundario invalido")) {
        errorMessage = "⚠️ Email secundário inválido. Verifique o formato do email.";
      } else if (errorMessage.toLowerCase().includes("request failed with status code 400")) {
        errorMessage = "⚠️ Dados inválidos. Verifique os campos e tente novamente.";
      }
      
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl">
        <div className="mb-4 flex items-center justify-between sm:mb-6">
          <h2 className="text-xl font-semibold sm:text-2xl">Editar Fornecedor</h2>
          <button
            type="button"
            className="btn btn-ghost btn-sm btn-circle"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text text-sm font-medium sm:text-base">Razão Social *</span>
            </label>
            <input
              type="text"
              placeholder="Digite a razão social da empresa"
              className={`input input-bordered input-sm w-full sm:input-md ${errors.razaoSocial ? "input-error" : ""}`}
              value={formData.razaoSocial}
              onChange={(e) => setFormData({ ...formData, razaoSocial: e.target.value })}
            />
            {errors.razaoSocial && (
              <label className="label">
                <span className="label-text-alt text-error">{errors.razaoSocial}</span>
              </label>
            )}
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text text-sm font-medium sm:text-base">CNPJ *</span>
            </label>
            <input
              type="text"
              placeholder="00.000.000/0000-00"
              className={`input input-bordered input-sm w-full sm:input-md ${errors.cnpj ? "input-error" : ""}`}
              value={formData.cnpj}
              onChange={(e) => setFormData({ ...formData, cnpj: formatCNPJ(e.target.value) })}
              maxLength={18}
            />
            {errors.cnpj && (
              <label className="label">
                <span className="label-text-alt text-error">{errors.cnpj}</span>
              </label>
            )}
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text text-sm font-medium sm:text-base">Email Primário *</span>
            </label>
            <input
              type="email"
              placeholder="contato@empresa.com"
              className={`input input-bordered input-sm w-full sm:input-md ${errors.emailPrimario ? "input-error" : ""}`}
              value={formData.emailPrimario}
              onChange={(e) => setFormData({ ...formData, emailPrimario: e.target.value })}
            />
            {errors.emailPrimario && (
              <label className="label">
                <span className="label-text-alt text-error">{errors.emailPrimario}</span>
              </label>
            )}
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text text-sm font-medium sm:text-base">Email Secundário</span>
            </label>
            <input
              type="email"
              placeholder="vendas@empresa.com (opcional)"
              className={`input input-bordered input-sm w-full sm:input-md ${errors.emailSecundario ? "input-error" : ""}`}
              value={formData.emailSecundario}
              onChange={(e) => setFormData({ ...formData, emailSecundario: e.target.value })}
            />
            {errors.emailSecundario && (
              <label className="label">
                <span className="label-text-alt text-error">{errors.emailSecundario}</span>
              </label>
            )}
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text text-sm font-medium sm:text-base">Nome do Responsável</span>
            </label>
            <input
              type="text"
              placeholder="Digite o nome do responsável (opcional)"
              className="input input-bordered input-sm w-full sm:input-md"
              value={formData.nomeResponsavel}
              onChange={(e) => setFormData({ ...formData, nomeResponsavel: e.target.value })}
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text text-sm font-medium sm:text-base">Cargo do Responsável</span>
            </label>
            <input
              type="text"
              placeholder="Digite o cargo (opcional)"
              className="input input-bordered input-sm w-full sm:input-md"
              value={formData.cargoResponsavel}
              onChange={(e) => setFormData({ ...formData, cargoResponsavel: e.target.value })}
            />
          </div>

          <div className="form-control">
            <label className="label cursor-pointer justify-start gap-3">
              <input
                type="checkbox"
                className="checkbox checkbox-primary"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              />
              <span className="label-text text-sm font-medium sm:text-base">Fornecedor Ativo</span>
            </label>
          </div>

          {submitError && (
            <div className="alert alert-error shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs sm:text-sm">{submitError}</span>
            </div>
          )}

          <div className="modal-action mt-4 sm:mt-6">
            <button
              type="button"
              className="btn btn-outline btn-sm sm:btn-md"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-sm sm:btn-md sm:min-w-[160px]"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="loading loading-spinner loading-xs sm:loading-sm"></span>
                  <span className="text-xs sm:text-sm">Salvando...</span>
                </span>
              ) : (
                <span className="text-xs sm:text-sm">Salvar Alterações</span>
              )}
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop bg-black/50" onClick={onCancel}></div>
    </div>
  );
};

export default SupplierEditModal;
