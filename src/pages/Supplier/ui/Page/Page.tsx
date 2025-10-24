import { FC, useEffect, useState } from "react";
import { SupplierForm, ConfirmDialog, SupplierEditModal } from "@/components";
import { SupplierService, Supplier } from "@/services/supplierService";

const Suppliers: FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [deletingSupplier, setDeletingSupplier] = useState<Supplier | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchSuppliers = async () => {
    setLoading(true);
    setError(null);
    try {
      const service = new SupplierService();
      const list = await service.listSuppliers();
      setSuppliers(list);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Erro ao listar fornecedores";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredByStatus = statusFilter
    ? suppliers.filter((s) => 
        statusFilter === "active" ? s.isActive : !s.isActive
      )
    : suppliers;
  const baseSuppliers = normalizedQuery
    ? filteredByStatus.filter(
        (s) =>
          s.razaoSocial?.toLowerCase().includes(normalizedQuery) ||
          s.cnpj?.toLowerCase().includes(normalizedQuery) ||
          s.emailPrimario?.toLowerCase().includes(normalizedQuery) ||
          s.nomeResponsavel?.toLowerCase().includes(normalizedQuery),
      )
    : filteredByStatus;

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const getVal = (s: Supplier, key: SortKey) => {
    switch (key) {
      case "razaoSocial":
        return (s.razaoSocial ?? "").toLowerCase();
      case "cnpj":
        return (s.cnpj ?? "").toLowerCase();
      case "emailPrimario":
        return (s.emailPrimario ?? "").toLowerCase();
      case "nomeResponsavel":
        return (s.nomeResponsavel ?? "").toLowerCase();
      case "isActive":
        return s.isActive ? 1 : 0;
      case "createdAt":
        return s.createdAt ? new Date(s.createdAt).getTime() : 0;
      default:
        return "";
    }
  };

  const displayedSuppliers = sortKey
    ? [...baseSuppliers].sort((a, b) => {
        const va = getVal(a, sortKey!);
        const vb = getVal(b, sortKey!);
        if (va < vb) return sortDir === "asc" ? -1 : 1;
        if (va > vb) return sortDir === "asc" ? 1 : -1;
        return 0;
      })
    : baseSuppliers;

  const handleDelete = async () => {
    if (!deletingSupplier) return;

    setIsDeleting(true);
    try {
      const service = new SupplierService();
      await service.deleteSupplier(deletingSupplier.id);
      setDeletingSupplier(null);
      await fetchSuppliers();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao deletar fornecedor";
      alert(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold sm:text-3xl">Fornecedores</h1>
            {loading ? (
              <span className="badge badge-outline">Carregando...</span>
            ) : (
              <span className="badge badge-primary">Total: {suppliers.length}</span>
            )}
          </div>
          <p className="text-sm text-base-content/70 sm:text-base">
            Gerencie os fornecedores do sistema
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            className="btn-primary btn btn-sm sm:btn-md"
            onClick={() => setShowForm(!showForm)}
          >
            <span className="hidden sm:inline">Novo Fornecedor</span>
            <span className="sm:hidden">Novo</span>
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {showForm && (
          <SupplierForm
            onSuccess={() => {
              setShowForm(false);
              fetchSuppliers();
            }}
            onCancel={() => setShowForm(false)}
          />
        )}

        {editingSupplier && (
          <SupplierEditModal
            supplier={editingSupplier}
            isOpen={!!editingSupplier}
            onSuccess={() => {
              setEditingSupplier(null);
              fetchSuppliers();
            }}
            onCancel={() => setEditingSupplier(null)}
          />
        )}

        {deletingSupplier && (
          <ConfirmDialog
            isOpen={!!deletingSupplier}
            title="Confirmar Desativação"
            message={`Tem certeza que deseja desativar o fornecedor "${deletingSupplier.razaoSocial}"?`}
            confirmLabel="Desativar"
            cancelLabel="Cancelar"
            variant="danger"
            isLoading={isDeleting}
            onConfirm={handleDelete}
            onCancel={() => setDeletingSupplier(null)}
          />
        )}

        <div className="rounded-box border border-base-300 bg-base-100 p-4 shadow sm:p-6">
          <h2 className="mb-4 text-lg font-semibold sm:text-xl">Lista de Fornecedores</h2>
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center">
            <div className="w-full md:w-auto">
              <select
                className="select-bordered select select-sm w-full sm:select-md md:max-w-xs"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">Todos os status</option>
                <option value="active">Ativos</option>
                <option value="inactive">Inativos</option>
              </select>
            </div>
            <div className="flex-1">
              <input
                type="text"
                className="input-bordered input input-sm w-full sm:input-md"
                placeholder="Buscar por razão social, CNPJ, email ou responsável"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {loading && (
            <div className="text-center text-base-content/70">
              Carregando fornecedores...
            </div>
          )}

          {error && (
            <div className="alert alert-error">
              <span>{error}</span>
            </div>
          )}

          {!loading && !error && displayedSuppliers.length === 0 && (
            <div className="text-center text-base-content/70">
              Nenhum fornecedor encontrado.
            </div>
          )}

          {!loading && !error && displayedSuppliers.length > 0 && (
            <>
              {/* Tabela para Desktop */}
              <div className="hidden overflow-x-auto lg:block">
                <table className="table-zebra table w-full">
                  <thead>
                    <tr>
                      <th
                        className="cursor-pointer select-none"
                        onClick={() => toggleSort("razaoSocial")}
                      >
                        Razão Social{" "}
                        {sortKey === "razaoSocial" && (
                          <span>{sortDir === "asc" ? "▲" : "▼"}</span>
                        )}
                      </th>
                      <th
                        className="cursor-pointer select-none"
                        onClick={() => toggleSort("cnpj")}
                      >
                        CNPJ{" "}
                        {sortKey === "cnpj" && (
                          <span>{sortDir === "asc" ? "▲" : "▼"}</span>
                        )}
                      </th>
                      <th
                        className="cursor-pointer select-none"
                        onClick={() => toggleSort("emailPrimario")}
                      >
                        Email{" "}
                        {sortKey === "emailPrimario" && (
                          <span>{sortDir === "asc" ? "▲" : "▼"}</span>
                        )}
                      </th>
                      <th
                        className="cursor-pointer select-none"
                        onClick={() => toggleSort("nomeResponsavel")}
                      >
                        Responsável{" "}
                        {sortKey === "nomeResponsavel" && (
                          <span>{sortDir === "asc" ? "▲" : "▼"}</span>
                        )}
                      </th>
                      <th
                        className="cursor-pointer select-none"
                        onClick={() => toggleSort("isActive")}
                      >
                        Status{" "}
                        {sortKey === "isActive" && (
                          <span>{sortDir === "asc" ? "▲" : "▼"}</span>
                        )}
                      </th>
                      <th
                        className="cursor-pointer select-none"
                        onClick={() => toggleSort("createdAt")}
                      >
                        Criado em{" "}
                        {sortKey === "createdAt" && (
                          <span>{sortDir === "asc" ? "▲" : "▼"}</span>
                        )}
                      </th>
                      <th className="text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedSuppliers.map((s) => (
                      <tr key={s.id}>
                        <td>{s.razaoSocial}</td>
                        <td>{s.cnpj}</td>
                        <td>{s.emailPrimario}</td>
                        <td>{s.nomeResponsavel || "-"}</td>
                        <td>
                          {s.isActive === undefined ? (
                            "-"
                          ) : s.isActive ? (
                            <span className="badge badge-success">Ativo</span>
                          ) : (
                            <span className="badge badge-ghost">Inativo</span>
                          )}
                        </td>
                        <td>
                          {s.createdAt
                            ? new Date(s.createdAt).toLocaleDateString("pt-BR")
                            : "-"}
                        </td>
                        <td>
                          <div className="flex items-center justify-center gap-2">
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => setEditingSupplier(s)}
                              title="Editar"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                              </svg>
                            </button>
                            <button
                              className="btn btn-ghost btn-sm text-error"
                              onClick={() => setDeletingSupplier(s)}
                              title="Excluir"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Cards para Mobile/Tablet */}
              <div className="space-y-3 lg:hidden">
                {displayedSuppliers.map((s) => (
                  <div
                    key={s.id}
                    className="rounded-lg border border-base-300 bg-base-100 p-3 shadow-sm sm:p-4"
                  >
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="truncate font-semibold text-base sm:text-lg">{s.razaoSocial}</h3>
                        <p className="truncate text-xs text-base-content/70 sm:text-sm">{s.cnpj}</p>
                      </div>
                      <div className="flex-shrink-0">
                        {s.isActive === undefined ? (
                          <span className="badge badge-ghost badge-sm">-</span>
                        ) : s.isActive ? (
                          <span className="badge badge-success badge-sm">Ativo</span>
                        ) : (
                          <span className="badge badge-ghost badge-sm">Inativo</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-1.5 text-xs sm:space-y-2 sm:text-sm">
                      <div className="flex justify-between gap-2">
                        <span className="font-medium text-base-content/70">Email:</span>
                        <span className="text-right truncate min-w-0 flex-1">
                          {s.emailPrimario}
                        </span>
                      </div>
                      
                      {s.emailSecundario && (
                        <div className="flex justify-between gap-2">
                          <span className="font-medium text-base-content/70">Email 2:</span>
                          <span className="text-right truncate min-w-0 flex-1">
                            {s.emailSecundario}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex justify-between gap-2">
                        <span className="font-medium text-base-content/70">Responsável:</span>
                        <span className="text-right">
                          {s.nomeResponsavel || "-"}
                        </span>
                      </div>
                      
                      {s.cargoResponsavel && (
                        <div className="flex justify-between gap-2">
                          <span className="font-medium text-base-content/70">Cargo:</span>
                          <span className="text-right">
                            {s.cargoResponsavel}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex justify-between gap-2">
                        <span className="font-medium text-base-content/70">Criado em:</span>
                        <span className="text-right">
                          {s.createdAt
                            ? new Date(s.createdAt).toLocaleDateString("pt-BR")
                            : "-"}
                        </span>
                      </div>
                    </div>

                    {/* Botões de Ação */}
                    <div className="mt-3 flex gap-2 border-t border-base-300 pt-3">
                      <button
                        className="btn btn-outline btn-sm flex-1"
                        onClick={() => setEditingSupplier(s)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                        <span>Editar</span>
                      </button>
                      <button
                        className="btn btn-outline btn-error btn-sm flex-1"
                        onClick={() => setDeletingSupplier(s)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <span>Excluir</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Suppliers;

type SortKey =
  | "razaoSocial"
  | "cnpj"
  | "emailPrimario"
  | "nomeResponsavel"
  | "isActive"
  | "createdAt";
