import { FC, useEffect, useState } from "react";
import { useAuth } from "@/contexts/useAuth";
import { StockServices } from "@/services/stockServices";
import type { Stock } from "@/services/stockServices";

type SortKey = 'name' | 'location' | 'active';

const Stocks: FC = () => {
  const { user } = useAuth();
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    const fetchStocks = async () => {
      // passar userId explicitamente para o serviço
      if (!user?.id) return;
      setLoading(true);
      setError(null);
      try {
        const service = new StockServices();
        const list = await service.listStock(user.id);
        setStocks(list);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Erro ao listar estoques";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchStocks();
  }, [user?.id]);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const baseStocks = normalizedQuery
    ? stocks.filter(s => (
        (s.name ?? '').toLowerCase().includes(normalizedQuery) ||
        (s.location ?? '').toLowerCase().includes(normalizedQuery)
      ))
    : stocks;

  // mostrar apenas estoques ativos
  const activeStocks = baseStocks.filter(s => s.active);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const getVal = (s: Stock, key: SortKey) => {
    switch (key) {
      case 'name':
        return (s.name ?? '').toLowerCase();
      case 'location':
        return (s.location ?? '').toLowerCase();
      case 'active':
        return s.active ? 1 : 0;
      default:
        return '';
    }
  };

  const displayedStocks = sortKey
    ? [...activeStocks].sort((a, b) => {
        const va = getVal(a, sortKey!);
        const vb = getVal(b, sortKey!);
        if (va < vb) return sortDir === 'asc' ? -1 : 1;
        if (va > vb) return sortDir === 'asc' ? 1 : -1;
        return 0;
      })
    : activeStocks;

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold sm:text-3xl">Estoques</h1>
            {loading ? (
              <span className="badge badge-outline">Carregando...</span>
            ) : (
              <span className="badge badge-primary">Total: {displayedStocks.length}</span>
            )}
          </div>
          <p className="text-sm text-base-content/70 sm:text-base">Gerencie os estoques do sistema</p>
        </div>
      </div>

      <div className="rounded-box border border-base-300 bg-base-100 p-4 shadow sm:p-6">
        <h2 className="mb-4 text-lg font-semibold sm:text-xl">Lista de Estoques</h2>
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center">
          <div className="flex-1">
            <input
              type="text"
              className="input input-bordered input-sm w-full sm:input-md"
              placeholder="Buscar por nome ou local"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {loading && (
          <div className="text-center text-base-content/70">Carregando estoques...</div>
        )}

        {error && (
          <div className="alert alert-error">
            <span>{error}</span>
          </div>
        )}

        {!loading && !error && displayedStocks.length === 0 && (
          <div className="text-center text-base-content/70">Nenhum estoque encontrado.</div>
        )}

        {!loading && !error && displayedStocks.length > 0 && (
          <>
            {/* Tabela para Desktop */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="table table-zebra w-full">
                <thead>
                  <tr>
                    <th className="cursor-pointer select-none" onClick={() => toggleSort('name')}>
                      Nome {sortKey === 'name' && (<span>{sortDir === 'asc' ? '▲' : '▼'}</span>)}
                    </th>
                    <th className="cursor-pointer select-none" onClick={() => toggleSort('location')}>
                      Local {sortKey === 'location' && (<span>{sortDir === 'asc' ? '▲' : '▼'}</span>)}
                    </th>
                    <th>
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {displayedStocks.map((s) => (
                    <tr key={s.id}>
                      <td>{s.name}</td>
                      <td>{s.location}</td>
                      <td>
                        <a href={`/stocks/${s.id}`} className="btn btn-sm btn-outline">Detalhes</a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Cards para Mobile/Tablet */}
            <div className="space-y-3 lg:hidden">
              {displayedStocks.map((s) => (
                <div
                  key={s.id}
                  className="rounded-lg border border-base-300 bg-base-100 p-3 shadow-sm sm:p-4"
                >
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="truncate font-semibold text-base sm:text-lg">{s.name}</h3>
                      <p className="flex items-center gap-1 text-xs text-base-content/70 sm:text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        {s.location}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <a href={`/stocks/${s.id}`} className="btn btn-outline btn-sm">
                      Ver Detalhes
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Stocks;