import { FC, useEffect, useState } from "react";
import { UserForm, UserExcelImport } from "@/components";
import { AuthService, AuthUser } from "@/services/authService";

const Users: FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const service = new AuthService();
        const list = await service.listUsers();
        setUsers(list);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Erro ao listar usuários";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const availableRoles = Array.from(new Set(users.map(u => u.role).filter(Boolean))) as string[];
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredByRole = roleFilter ? users.filter(u => u.role === roleFilter) : users;
  const baseUsers = normalizedQuery
    ? filteredByRole.filter(u => (u.name?.toLowerCase().includes(normalizedQuery) || u.email?.toLowerCase().includes(normalizedQuery)))
    : filteredByRole;
  
  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };
  
  const getVal = (u: AuthUser, key: SortKey) => {
    switch (key) {
      case 'name':
        return (u.name ?? '').toLowerCase();
      case 'email':
        return (u.email ?? '').toLowerCase();
      case 'role':
        return (u.role ?? '').toLowerCase();
      case 'isActive':
        return u.isActive ? 1 : 0;
      case 'validUntil':
        return u.validUntil ? new Date(u.validUntil).getTime() : 0;
      case 'createdAt':
        return u.createdAt ? new Date(u.createdAt).getTime() : 0;
      default:
        return '';
    }
  };
  
  const displayedUsers = sortKey
    ? [...baseUsers].sort((a, b) => {
        const va = getVal(a, sortKey!);
        const vb = getVal(b, sortKey!);
        if (va < vb) return sortDir === 'asc' ? -1 : 1;
        if (va > vb) return sortDir === 'asc' ? 1 : -1;
        return 0;
      })
    : baseUsers;

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">Usuários</h1>
            {loading ? (
              <span className="badge badge-outline">Carregando...</span>
            ) : (
              <span className="badge badge-primary">Total: {users.length}</span>
            )}
          </div>
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
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center">
            <div className="flex items-center gap-3">
              <select
                className="select select-bordered w-full max-w-xs"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="">Todos os acessos</option>
                {availableRoles.map((r) => (
                  <option key={r} value={r || ''}>{r ? r.charAt(0).toUpperCase() + r.slice(1).toLowerCase() : ''}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <input
                type="text"
                className="input input-bordered w-full"
                placeholder="Buscar por nome ou email"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {loading && (
            <div className="text-center text-base-content/70">Carregando usuários...</div>
          )}

          {error && (
            <div className="alert alert-error">
              <span>{error}</span>
            </div>
          )}

          {!loading && !error && displayedUsers.length === 0 && (
            <div className="text-center text-base-content/70">Nenhum usuário encontrado.</div>
          )}

          {!loading && !error && displayedUsers.length > 0 && (
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full">
                <thead>
                  <tr>
                    <th className="cursor-pointer select-none" onClick={() => toggleSort('name')}>
                      Nome {sortKey === 'name' && (<span>{sortDir === 'asc' ? '▲' : '▼'}</span>)}
                    </th>
                    <th className="cursor-pointer select-none" onClick={() => toggleSort('email')}>
                      Email {sortKey === 'email' && (<span>{sortDir === 'asc' ? '▲' : '▼'}</span>)}
                    </th>
                    <th className="cursor-pointer select-none" onClick={() => toggleSort('role')}>
                      Acesso {sortKey === 'role' && (<span>{sortDir === 'asc' ? '▲' : '▼'}</span>)}
                    </th>
                    <th className="cursor-pointer select-none" onClick={() => toggleSort('isActive')}>
                      Status {sortKey === 'isActive' && (<span>{sortDir === 'asc' ? '▲' : '▼'}</span>)}
                    </th>
                    <th className="cursor-pointer select-none" onClick={() => toggleSort('validUntil')}>
                      Validade {sortKey === 'validUntil' && (<span>{sortDir === 'asc' ? '▲' : '▼'}</span>)}
                    </th>
                    <th className="cursor-pointer select-none" onClick={() => toggleSort('createdAt')}>
                      Criado em {sortKey === 'createdAt' && (<span>{sortDir === 'asc' ? '▲' : '▼'}</span>)}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {displayedUsers.map((u) => (
                    <tr key={u.id}>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>{u.role ? u.role.charAt(0).toUpperCase() + u.role.slice(1).toLowerCase() : "-"}</td>
                      <td>
                        {u.isActive === undefined ? "-" : u.isActive ? (
                          <span className="badge badge-success">Ativo</span>
                        ) : (
                          <span className="badge badge-ghost">Inativo</span>
                        )}
                      </td>
                      <td>{u.validUntil ? new Date(u.validUntil).toLocaleDateString('pt-BR') : "-"}</td>
                      <td>{u.createdAt ? new Date(u.createdAt).toLocaleString() : "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Users;

type SortKey = 'name' | 'email' | 'role' | 'isActive' | 'validUntil' | 'createdAt';
