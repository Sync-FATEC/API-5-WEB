import { FC, FormEvent, useState } from "react";
import { postJson } from "@/shared/api";

type SupplierFormData = {
  razaoSocial: string;
  nomeResponsavel: string;
  cargoResponsavel: string;
  cnpj: string;
  emailPrimario: string;
  emailSecundario: string;
};

type Props = {
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

export const SupplierForm: FC<Props> = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState<SupplierFormData>({
    razaoSocial: "",
    nomeResponsavel: "",
    cargoResponsavel: "",
    cnpj: "",
    emailPrimario: "",
    emailSecundario: "",
  });
  const [errors, setErrors] = useState<{
    razaoSocial?: string;
    cnpj?: string;
    emailPrimario?: string;
    emailSecundario?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>("");

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

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await postJson("/suppliers", {
        ...formData,
        emailPrimario: formData.emailPrimario.toLowerCase(),
        emailSecundario: formData.emailSecundario ? formData.emailSecundario.toLowerCase() : undefined,
      });
      setFormData({
        razaoSocial: "",
        nomeResponsavel: "",
        cargoResponsavel: "",
        cnpj: "",
        emailPrimario: "",
        emailSecundario: "",
      });
      if (onSuccess) onSuccess();
    } catch (error: any) {
      let errorMessage = error?.message || "Erro ao cadastrar fornecedor";
      
      // Tratar erros específicos
      if (errorMessage.toLowerCase().includes("cnpj inválido") || 
          errorMessage.toLowerCase().includes("cnpj invalido")) {
        errorMessage = "⚠️ CNPJ inválido. Verifique se o número está correto e tente novamente.";
      } else if (errorMessage.toLowerCase().includes("cnpj já cadastrado") || 
                 errorMessage.toLowerCase().includes("cnpj ja cadastrado")) {
        errorMessage = "⚠️ Este CNPJ já está cadastrado no sistema.";
      } else if (errorMessage.toLowerCase().includes("email primário inválido") ||
                 errorMessage.toLowerCase().includes("email primario invalido")) {
        errorMessage = "⚠️ Email primário inválido. Verifique o formato do email.";
      } else if (errorMessage.toLowerCase().includes("email secundário inválido") ||
                 errorMessage.toLowerCase().includes("email secundario invalido")) {
        errorMessage = "⚠️ Email secundário inválido. Verifique o formato do email.";
      }
      
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-box border border-base-300 bg-base-100 p-4 shadow sm:p-6">
      <h2 className="mb-4 text-xl font-semibold sm:mb-6 sm:text-2xl">Cadastrar Fornecedor</h2>

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

        {submitError && (
          <div className="alert alert-error shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{submitError}</span>
          </div>
        )}

        <div className="mt-4 flex flex-col-reverse gap-2 sm:mt-6 sm:flex-row sm:justify-end sm:gap-3">
          {onCancel && (
            <button
              type="button"
              className="btn btn-outline btn-sm sm:btn-md"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            className="btn btn-primary btn-sm sm:btn-md sm:min-w-[160px]"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="loading loading-spinner loading-xs sm:loading-sm"></span>
                <span className="text-xs sm:text-sm">Cadastrando...</span>
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                <span className="text-xs sm:text-sm">Cadastrar</span>
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SupplierForm;
