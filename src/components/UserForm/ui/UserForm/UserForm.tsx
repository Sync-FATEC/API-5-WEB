import { FC, FormEvent, useState } from "react";
import { postJson } from "@/shared/api";


export enum RoleEnum {
  SOLDADO = "SOLDADO",
  SUPERVISOR = "SUPERVISOR",
  ADMIN = "ADMIN"
}

type UserFormData = {
  name: string;
  email: string;
  role: RoleEnum | "";
};

type Props = {
  onSuccess?: () => void;
  onCancel?: () => void;
};

export const UserForm: FC<Props> = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    email: "",
    role: "",
  });
  const [errors, setErrors] = useState<{ name?: string; email?: string; role?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>("");

  const validate = (): boolean => {
    const newErrors: { name?: string; email?: string; role?: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = "Nome é obrigatório";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email é obrigatório";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }

    if (!formData.role.trim()) {
      newErrors.role = "Role/Papel é obrigatório";
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
      await postJson("/auth/register", {
        users: [{ ...formData, email: formData.email.toLowerCase() }],
      });
      setFormData({ name: "", email: "", role: "" });
      if (onSuccess) onSuccess();
    } catch (error: any) {
      setSubmitError(error?.message || "Erro ao cadastrar usuário");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-box border border-base-300 bg-base-100 p-4 shadow sm:p-6">
      <h2 className="mb-4 text-xl font-semibold sm:mb-6 sm:text-2xl">Cadastrar Usuário</h2>

      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text text-sm font-medium sm:text-base">Nome completo</span>
          </label>
          <input
            type="text"
            placeholder="Digite o nome"
            className={`input input-bordered input-sm w-full sm:input-md ${errors.name ? "input-error" : ""}`}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          {errors.name && (
            <label className="label">
              <span className="label-text-alt text-error">{errors.name}</span>
            </label>
          )}
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text text-sm font-medium sm:text-base">E-mail</span>
          </label>
          <input
            type="email"
            placeholder="usuario@exemplo.com"
            className={`input input-bordered input-sm w-full sm:input-md ${errors.email ? "input-error" : ""}`}
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          {errors.email && (
            <label className="label">
              <span className="label-text-alt text-error">{errors.email}</span>
            </label>
          )}
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text text-sm font-medium sm:text-base">Papel/Cargo</span>
          </label>
          <select
            className={`select select-bordered select-sm w-full sm:select-md ${errors.role ? "select-error" : ""}`}
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value as RoleEnum })}
          >
            <option value="">Selecione o papel</option>
            <option value={RoleEnum.SOLDADO}>Soldado</option>
            <option value={RoleEnum.SUPERVISOR}>Supervisor</option>
            <option value={RoleEnum.ADMIN}>Admin</option>
          </select>
          {errors.role && (
            <label className="label">
              <span className="label-text-alt text-error">{errors.role}</span>
            </label>
          )}
        </div>

        {submitError && (
          <div className="alert alert-error">
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

export default UserForm;
