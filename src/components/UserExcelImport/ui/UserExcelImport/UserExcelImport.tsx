import { FC, useEffect, useMemo, useRef, useState } from "react";
import { useUserExcelImport } from "@/components/UserExcelImport/lib/useUserExcelImport";
import { useAuth } from "@/contexts/useAuth";
import { StockServices, Stock } from "@/services/stockServices";

type Props = {
  onSuccess?: () => void;
};

export const UserExcelImport: FC<Props> = ({ onSuccess }) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { users, errors, isParsing, isSubmitting, onFileChange, submitWithStock, clear, updateUser, deleteUser } = useUserExcelImport();
  const { user } = useAuth();
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loadingStocks, setLoadingStocks] = useState(false);
  const [stockId, setStockId] = useState<string>("");
  const [editingCell, setEditingCell] = useState<{ index: number; field: string } | null>(null);

  const selectedStock = useMemo(() => stocks.find((s) => s.id === stockId), [stocks, stockId]);

  useEffect(() => {
    const fetchStocks = async () => {
      if (!user?.id) return;
      setLoadingStocks(true);
      try {
        const service = new StockServices();
        const list = await service.listStock(user.id);
        setStocks(list);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingStocks(false);
      }
    };
    fetchStocks();
  }, [user?.id]);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    await onFileChange(file);
  };

  const handleSubmit = async () => {
    if (!stockId) return;
    await submitWithStock(stockId);
    if (onSuccess) onSuccess();
  };

  return (
    <div className="rounded-lg border border-base-300 bg-base-100 shadow-lg">
      <div className="space-y-6 p-6">
        {/* Header com título e estoque */}
        <div>
          <h2 className="text-2xl font-bold text-base-content">Cadastro de usuários via Excel</h2>
          <p className="mt-1 text-sm text-base-content/70">Importe múltiplos usuários de uma vez</p>
          {selectedStock && (
            <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm">
              <span className="text-primary">📦</span>
              <span className="font-medium text-primary">{selectedStock.name}</span>
            </div>
          )}
        </div>

        {/* Seleção de estoque */}
        <div className="form-control">
          <label className="label">
            <span className="label-text font-semibold">Estoque de destino</span>
          </label>
          <select
            className="select select-bordered select-primary w-full max-w-md"
            value={stockId}
            onChange={(e) => setStockId(e.target.value)}
            disabled={loadingStocks}
          >
            <option value="">{loadingStocks ? "Carregando estoques..." : "Selecione o estoque"}</option>
            {stocks.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Botão de download da planilha padrão */}
        <div className="rounded-lg border-2 border-dashed border-base-300 bg-base-200/50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/20">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="h-5 w-5 stroke-info">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="font-medium">Arquivo modelo</p>
                <p className="text-xs text-base-content/60">Use este formato para importação</p>
              </div>
            </div>
            <a
              href="/planilha_padrao.xlsx"
              download="planilha_padrao.xlsx"
              className="btn btn-info btn-sm gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="h-4 w-4 stroke-current">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Baixar modelo
            </a>
          </div>
        </div>

        {/* Upload do arquivo */}
        <div className="form-control">
          <label className="label">
            <span className="label-text font-semibold">Arquivo Excel (.xlsx, .xls)</span>
          </label>
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.xls"
            className="file-input file-input-bordered file-input-primary w-full max-w-md"
            onChange={handleFile}
          />
        </div>

        {/* Botões de ação */}
        <div className="flex flex-wrap gap-2">
          <button
            className="btn btn-success gap-2"
            onClick={handleSubmit}
            disabled={isParsing || isSubmitting || users.length === 0 || !stockId}
          >
            {isSubmitting ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Cadastrando...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="h-5 w-5 stroke-current">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Cadastrar Usuários
              </>
            )}
          </button>
          <button className="btn btn-outline gap-2" onClick={clear} disabled={isParsing || isSubmitting}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="h-5 w-5 stroke-current">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
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
          <div className="overflow-x-auto rounded-lg border border-base-300">
            <table className="table">
              <thead className="bg-base-200">
                <tr>
                  <th className="font-semibold">#</th>
                  <th className="font-semibold">Nome</th>
                  <th className="font-semibold">Email</th>
                  <th className="font-semibold">Role</th>
                  <th className="font-semibold">Estoque</th>
                  <th className="font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, idx) => (
                  <tr key={`${u.email}-${idx}`} className="hover">
                    <td>{idx + 1}</td>
                    <td>
                      {editingCell?.index === idx && editingCell?.field === 'name' ? (
                        <input
                          type="text"
                          className="input input-sm input-bordered w-full"
                          value={u.name}
                          onChange={(e) => updateUser(idx, 'name', e.target.value)}
                          onBlur={() => setEditingCell(null)}
                          autoFocus
                        />
                      ) : (
                        <div
                          className="cursor-pointer font-medium hover:bg-base-200 rounded px-2 py-1"
                          onClick={() => setEditingCell({ index: idx, field: 'name' })}
                        >
                          {u.name}
                        </div>
                      )}
                    </td>
                    <td>
                      {editingCell?.index === idx && editingCell?.field === 'email' ? (
                        <input
                          type="email"
                          className="input input-sm input-bordered w-full"
                          value={u.email}
                          onChange={(e) => updateUser(idx, 'email', e.target.value)}
                          onBlur={() => setEditingCell(null)}
                          autoFocus
                        />
                      ) : (
                        <div
                          className="cursor-pointer text-sm text-base-content/70 hover:bg-base-200 rounded px-2 py-1"
                          onClick={() => setEditingCell({ index: idx, field: 'email' })}
                        >
                          {u.email}
                        </div>
                      )}
                    </td>
                    <td>
                      {editingCell?.index === idx && editingCell?.field === 'role' ? (
                        <select
                          className="select select-sm select-bordered"
                          value={u.role}
                          onChange={(e) => {
                            updateUser(idx, 'role', e.target.value);
                            setEditingCell(null);
                          }}
                          autoFocus
                          onBlur={() => setEditingCell(null)}
                        >
                          <option value="SOLDADO">SOLDADO</option>
                          <option value="SUPERVISOR">SUPERVISOR</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      ) : (
                        <span
                          className="badge badge-primary badge-sm cursor-pointer"
                          onClick={() => setEditingCell({ index: idx, field: 'role' })}
                        >
                          {u.role}
                        </span>
                      )}
                    </td>
                    <td className="text-sm">{selectedStock ? selectedStock.name : "-"}</td>
                    <td>
                      <button
                        className="btn btn-ghost btn-xs text-error"
                        onClick={() => deleteUser(idx)}
                        title="Remover usuário"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="h-4 w-4 stroke-current">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length > 10 && (
              <div className="bg-base-200 px-4 py-2 text-center text-sm text-base-content/60">
                Mostrando todos os {users.length} usuários
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserExcelImport;
