import { FC, FormEvent, useState } from "react";
import { postJson } from "@/shared/api";

type UserFormData = {
  name: string;
  email: string;
  role: string;
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
  const [errors, setErrors] = useState<Partial<UserFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>("");

  const validate = (): boolean => {
    const newErrors: Partial<UserFormData> = {};

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
      await postJson("/users", {
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
    <div className="rounded-box border border-base-300 bg-base-100 p-6 shadow">
      <h2 className="mb-6 text-2xl font-semibold">Cadastrar Usuário</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium">Nome completo</span>
          </label>
          <input
            type="text"
            placeholder="Digite o nome"
            className={`input input-bordered w-full ${errors.name ? "input-error" : ""}`}
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
            <span className="label-text font-medium">E-mail</span>
          </label>
          <input
            type="email"
            placeholder="usuario@exemplo.com"
            className={`input input-bordered w-full ${errors.email ? "input-error" : ""}`}
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
            <span className="label-text font-medium">Papel/Cargo</span>
          </label>
          <select
            className={`select select-bordered w-full ${errors.role ? "select-error" : ""}`}
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          >
            <option value="">Selecione o papel</option>
            <option value="admin">Administrador</option>
            <option value="manager">Gerente</option>
            <option value="user">Usuário</option>
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

        <div className="flex gap-3">
          <button
            type="submit"
            className="btn btn-primary flex-1"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Cadastrando..." : "Cadastrar"}
          </button>
          {onCancel && (
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default UserForm;
