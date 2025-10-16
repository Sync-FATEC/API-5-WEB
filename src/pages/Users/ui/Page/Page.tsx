import { FC, useState } from "react";
import { UserForm, UserExcelImport } from "@/components";

const Users: FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Usuários</h1>
          <p className="text-base-content/70">Gerencie os usuários do sistema</p>
        </div>
        <div className="flex gap-2">
          <button
            className="btn btn-outline btn-primary"
            onClick={() => setShowImport(!showImport)}
          >
            📥 Importar Excel
          </button>
          <button
            className="btn btn-primary"
            onClick={() => setShowForm(!showForm)}
          >
            ➕ Novo Usuário
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {showForm && (
          <UserForm
            onSuccess={() => {
              setShowForm(false);
              alert("Usuário cadastrado com sucesso!");
            }}
            onCancel={() => setShowForm(false)}
          />
        )}

        {showImport && (
          <UserExcelImport
            onSuccess={() => {
              setShowImport(false);
              alert("Usuários importados com sucesso!");
            }}
          />
        )}

        <div className="rounded-box border border-base-300 bg-base-100 p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold">Lista de Usuários</h2>
          <div className="text-center text-base-content/70">
            <p>Em breve: tabela de usuários com edição e exclusão</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users;
