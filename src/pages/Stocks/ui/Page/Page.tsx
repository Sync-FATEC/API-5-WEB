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
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">Estoques</h1>
            {loading ? (
              <span className="badge badge-outline">Carregando...</span>
            ) : (
              <span className="badge badge-primary">Total: {displayedStocks.length}</span>
            )}
          </div>
          <p className="text-base-content/70">Gerencie os estoques do sistema</p>
        </div>
      </div>

      <div className="rounded-box border border-base-300 bg-base-100 p-6 shadow">
        <h2 className="mb-4 text-xl font-semibold">Lista de Estoques</h2>
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center">
          <div className="flex-1">
            <input
              type="text"
              className="input input-bordered w-full"
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
          <div className="overflow-x-auto">
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
        )}
      </div>
    </div>
  );
};

export default Stocks;