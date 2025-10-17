import { FC, useRef } from "react";
import { useUserExcelImport } from "@/components/UserExcelImport/lib/useUserExcelImport";

type Props = {
  onSuccess?: () => void;
};

export const UserExcelImport: FC<Props> = ({ onSuccess }) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { users, errors, isParsing, isSubmitting, onFileChange, submit, clear } = useUserExcelImport();

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    await onFileChange(file);
  };

  const handleSubmit = async () => {
    await submit();
    if (onSuccess) onSuccess();
  };

  return (
    <div className="rounded-box border border-base-200 bg-base-100 p-0 shadow">
      <div className="rounded-t-box bg-primary p-4 text-primary-content">
        <h2 className="text-lg font-semibold">Cadastro de usuários (Excel)</h2>
        <p className="text-primary-content/80 text-sm">Selecione o arquivo e envie</p>
      </div>
      <div className="p-4">
      <div className="flex flex-col gap-3">
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls"
          className="file-input file-input-bordered w-full max-w-xs"
          onChange={handleFile}
        />
        <div className="flex items-center gap-2">
          <button
            className="btn btn-success"
            onClick={handleSubmit}
            disabled={isParsing || isSubmitting || users.length === 0}
          >
            {isSubmitting ? "Enviando..." : "Enviar para o backend"}
          </button>
          <button className="btn" onClick={clear} disabled={isParsing || isSubmitting}>
            Limpar
          </button>
        </div>

        {isParsing && <div className="text-sm opacity-70">Lendo arquivo...</div>}
        {errors.length > 0 && (
          <div className="alert alert-warning">
            <div>
              <span>Foram encontrados alguns problemas:</span>
              <ul className="list-disc pl-6">
                {errors.map((err, i) => (
                  <li key={i} className="text-sm">
                    {err}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {users.length > 0 && (
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                {users.slice(0, 10).map((u, idx) => (
                  <tr key={u.email}>
                    <td>{idx + 1}</td>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length > 10 && (
              <div className="mt-2 text-sm opacity-60">
                e mais {users.length - 10} registros...
              </div>
            )}
          </div>
        )}
      </div>
    </div>
    </div>
  );
};

export default UserExcelImport;
