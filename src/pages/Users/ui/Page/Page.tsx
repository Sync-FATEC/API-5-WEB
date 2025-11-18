import { FC, useEffect, useState } from "react";
import { UserForm, UserExcelImport, StockChangeModal, SuccessModal } from "@/components";
import { AuthService, AuthUser } from "@/services/authService";

const Users: FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AuthUser | null>(null);
  const [successModal, setSuccessModal] = useState<{ isOpen: boolean; message: string }>({
    isOpen: false,
    message: "",
  });

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const service = new AuthService();
        const list = await service.listUsers();
        setUsers(list);
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Erro ao listar usuários";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleOpenStockModal = (user: AuthUser) => {
    setSelectedUser(user);
    setShowStockModal(true);
  };

  const handleCloseStockModal = () => {
    setShowStockModal(false);
    setSelectedUser(null);
  };

  const handleStockChangeSuccess = async () => {
    // Recarregar a lista de usuários após a troca de estoque
    setLoading(true);
    try {
      const service = new AuthService();
      const list = await service.listUsers();
      setUsers(list);
    } catch (err) {
      console.error("Erro ao recarregar usuários:", err);
    } finally {
      setLoading(false);
    }
  };

  const availableRoles = Array.from(
    new Set(users.map((u) => u.role).filter(Boolean)),
  ) as string[];
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredByRole = roleFilter
    ? users.filter((u) => u.role === roleFilter)
    : users;
  const baseUsers = normalizedQuery
    ? filteredByRole.filter(
        (u) =>
          u.name?.toLowerCase().includes(normalizedQuery) ||
          u.email?.toLowerCase().includes(normalizedQuery),
      )
    : filteredByRole;

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const getVal = (u: AuthUser, key: SortKey) => {
    switch (key) {
      case "name":
        return (u.name ?? "").toLowerCase();
      case "email":
        return (u.email ?? "").toLowerCase();
      case "role":
        return (u.role ?? "").toLowerCase();
      case "isActive":
        return u.isActive ? 1 : 0;
      case "validUntil":
        return u.validUntil ? new Date(u.validUntil).getTime() : 0;
      case "createdAt":
        return u.createdAt ? new Date(u.createdAt).getTime() : 0;
      default:
        return "";
    }
  };

  const displayedUsers = sortKey
    ? [...baseUsers].sort((a, b) => {
        const va = getVal(a, sortKey!);
        const vb = getVal(b, sortKey!);
        if (va < vb) return sortDir === "asc" ? -1 : 1;
        if (va > vb) return sortDir === "asc" ? 1 : -1;
        return 0;
      })
    : baseUsers;

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold sm:text-3xl">Usuários</h1>
            {loading ? (
              <span className="badge badge-outline">Carregando...</span>
            ) : (
              <span className="badge badge-primary">Total: {users.length}</span>
            )}
          </div>
          <p className="text-sm text-base-content/70 sm:text-base">
            Gerencie os usuários do sistema
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            className="btn-primary btn-outline btn btn-sm sm:btn-md"
            onClick={() => setShowImport(!showImport)}
          >
            <span className="hidden sm:inline">Importar Excel</span>
            <span className="sm:hidden">Importar</span>
          </button>
          <button
            className="btn-primary btn btn-sm sm:btn-md"
            onClick={() => setShowForm(!showForm)}
          >
            <span className="hidden sm:inline">Novo Usuário</span>
            <span className="sm:hidden">Novo</span>
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {showForm && (
          <UserForm
            onSuccess={() => {
              setShowForm(false);
              setSuccessModal({
                isOpen: true,
                message: "Usuário cadastrado com sucesso!",
              });
            }}
            onCancel={() => setShowForm(false)}
          />
        )}

        {showImport && (
          <UserExcelImport
            onSuccess={() => {
              setShowImport(false);
              setSuccessModal({
                isOpen: true,
                message: "Usuários importados com sucesso!",
              });
            }}
          />
        )}

        <div className="rounded-box border border-base-300 bg-base-100 p-4 shadow sm:p-6">
          <h2 className="mb-4 text-lg font-semibold sm:text-xl">Lista de Usuários</h2>
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center">
            <div className="w-full md:w-auto">
              <select
                className="select-bordered select select-sm w-full sm:select-md md:max-w-xs"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="">Todos os acessos</option>
                {availableRoles.map((r) => (
                  <option key={r} value={r || ""}>
                    {r
                      ? r.charAt(0).toUpperCase() + r.slice(1).toLowerCase()
                      : ""}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <input
                type="text"
                className="input-bordered input input-sm w-full sm:input-md"
                placeholder="Buscar por nome ou email"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {loading && (
            <div className="text-center text-base-content/70">
              Carregando usuários...
            </div>
          )}

          {error && (
            <div className="alert alert-error">
              <span>{error}</span>
            </div>
          )}

          {!loading && !error && displayedUsers.length === 0 && (
            <div className="text-center text-base-content/70">
              Nenhum usuário encontrado.
            </div>
          )}

          {!loading && !error && displayedUsers.length > 0 && (
            <>
              {/* Tabela para Desktop */}
              <div className="hidden overflow-x-auto lg:block">
                <table className="table-zebra table w-full">
                  <thead>
                    <tr>
                      <th
                        className="cursor-pointer select-none"
                        onClick={() => toggleSort("name")}
                      >
                        Nome{" "}
                        {sortKey === "name" && (
                          <span>{sortDir === "asc" ? "▲" : "▼"}</span>
                        )}
                      </th>
                      <th
                        className="cursor-pointer select-none"
                        onClick={() => toggleSort("email")}
                      >
                        Email{" "}
                        {sortKey === "email" && (
                          <span>{sortDir === "asc" ? "▲" : "▼"}</span>
                        )}
                      </th>
                      <th
                        className="cursor-pointer select-none"
                        onClick={() => toggleSort("role")}
                      >
                        Acesso{" "}
                        {sortKey === "role" && (
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
                        onClick={() => toggleSort("validUntil")}
                      >
                        Validade{" "}
                        {sortKey === "validUntil" && (
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
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedUsers.map((u) => (
                      <tr key={u.id}>
                        <td>{u.name}</td>
                        <td>{u.email}</td>
                        <td>
                          {u.role
                            ? u.role.charAt(0).toUpperCase() +
                              u.role.slice(1).toLowerCase()
                            : "-"}
                        </td>
                        <td>
                          {u.isActive === undefined ? (
                            "-"
                          ) : u.isActive ? (
                            <span className="badge badge-success">Ativo</span>
                          ) : (
                            <span className="badge badge-ghost">Inativo</span>
                          )}
                        </td>
                        <td>
                          {u.validUntil
                            ? new Date(u.validUntil).toLocaleDateString("pt-BR")
                            : "-"}
                        </td>
                        <td>
                          {u.createdAt
                            ? new Date(u.createdAt).toLocaleString()
                            : "-"}
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline btn-primary"
                            onClick={() => handleOpenStockModal(u)}
                            title="Alterar Estoque"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                              />
                            </svg>
                            <span className="hidden sm:inline ml-1">Estoque</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Cards para Mobile/Tablet */}
              <div className="space-y-3 lg:hidden">
                {displayedUsers.map((u) => (
                  <div
                    key={u.id}
                    className="rounded-lg border border-base-300 bg-base-100 p-3 shadow-sm sm:p-4"
                  >
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="truncate font-semibold text-base sm:text-lg">{u.name}</h3>
                        <p className="truncate text-xs text-base-content/70 sm:text-sm">{u.email}</p>
                      </div>
                      <div className="flex-shrink-0">
                        {u.isActive === undefined ? (
                          <span className="badge badge-ghost badge-sm">-</span>
                        ) : u.isActive ? (
                          <span className="badge badge-success badge-sm">Ativo</span>
                        ) : (
                          <span className="badge badge-ghost badge-sm">Inativo</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-1.5 text-xs sm:space-y-2 sm:text-sm">
                      <div className="flex justify-between gap-2">
                        <span className="font-medium text-base-content/70">Acesso:</span>
                        <span className="text-right">
                          {u.role
                            ? u.role.charAt(0).toUpperCase() +
                              u.role.slice(1).toLowerCase()
                            : "-"}
                        </span>
                      </div>
                      
                      <div className="flex justify-between gap-2">
                        <span className="font-medium text-base-content/70">Validade:</span>
                        <span className="text-right">
                          {u.validUntil
                            ? new Date(u.validUntil).toLocaleDateString("pt-BR")
                            : "-"}
                        </span>
                      </div>
                      
                      <div className="flex justify-between gap-2">
                        <span className="font-medium text-base-content/70">Criado em:</span>
                        <span className="text-right">
                          {u.createdAt
                            ? new Date(u.createdAt).toLocaleDateString("pt-BR")
                            : "-"}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-base-300">
                      <button
                        className="btn btn-sm btn-outline btn-primary w-full"
                        onClick={() => handleOpenStockModal(u)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                          />
                        </svg>
                        Alterar Estoque
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal de Troca de Estoque */}
      {selectedUser && (
          <StockChangeModal
            isOpen={showStockModal}
            onClose={handleCloseStockModal}
            userId={selectedUser.id}
            userName={selectedUser.name || "Usuário"}
            userStocks={selectedUser.stocks || []}
            onSuccess={handleStockChangeSuccess}
          />
        )}

      {/* Modal de Sucesso */}
      <SuccessModal
        isOpen={successModal.isOpen}
        message={successModal.message}
        onClose={() => setSuccessModal({ isOpen: false, message: "" })}
      />
    </div>
  );
};

export default Users;

type SortKey =
  | "name"
  | "email"
  | "role"
  | "isActive"
  | "validUntil"
  | "createdAt";
