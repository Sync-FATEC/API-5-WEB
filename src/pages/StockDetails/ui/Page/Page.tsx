import { FC, useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "@/contexts/useAuth";
import {
  ReportsService,
  type CompleteDashboard,
  type Period,
} from "@/services/reportsService";

const StockDetails: FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [period, setPeriod] = useState<Period>("monthly");
  const [startDate, setStartDate] = useState<string>("2025-01-01");
  const [endDate, setEndDate] = useState<string>("2025-10-20");

  const [dashboard, setDashboard] = useState<CompleteDashboard | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canFetch = useMemo(() => !!id && !!user?.id, [id, user?.id]);

  const fetchDashboard = async () => {
    if (!canFetch || !id) return;
    setLoading(true);
    setError(null);
    try {
      const service = new ReportsService();
      const data = await service.getCompleteDashboard(id, {
        period,
        startDate,
        endDate,
      });
      setDashboard(data);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Erro ao carregar dashboard";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, period, startDate, endDate, canFetch]);

  const handleDownload = async (format: "pdf" | "excel") => {
    if (!id) return;
    try {
      const service = new ReportsService();
      const blob = await service.downloadCompleteReport(format, id, {
        period,
        startDate,
        endDate,
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `dashboard-${id}-${period}.${
        format === "pdf" ? "pdf" : "xlsx"
      }`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Erro ao baixar relatório";
      setError(msg);
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Dashboard do Estoque</h1>
          <p className="text-sm text-base-content/70 sm:text-base">
            Visualização consolidada para o estoque selecionado
          </p>
        </div>
        <Link to="/stocks" className="btn-outline btn btn-sm sm:btn-md">
          Voltar
        </Link>
      </div>

      {/* Filtros */}
      <div className="rounded-box mb-6 border border-base-300 bg-base-100 p-3 sm:p-4">
        <div className="grid grid-cols-1 items-end gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-5">
          <div>
            <label className="label">
              <span className="label-text text-xs sm:text-sm">Início</span>
            </label>
            <input
              type="date"
              className="input-bordered input input-sm w-full sm:input-md"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <label className="label">
              <span className="label-text text-xs sm:text-sm">Fim</span>
            </label>
            <input
              type="date"
              className="input-bordered input input-sm w-full sm:input-md"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <button
            className="btn-primary btn btn-sm w-full sm:btn-md md:w-auto"
            onClick={fetchDashboard}
          >
            Atualizar
          </button>
          <button
            className="btn btn-sm w-full sm:btn-md md:w-auto"
            onClick={() => handleDownload("pdf")}
          >
            <span className="hidden sm:inline">Baixar PDF</span>
            <span className="sm:hidden">PDF</span>
          </button>
          <button
            className="btn btn-sm w-full sm:btn-md md:w-auto"
            onClick={() => handleDownload("excel")}
          >
            <span className="hidden sm:inline">Baixar Excel</span>
            <span className="sm:hidden">Excel</span>
          </button>
        </div>
        {id && (
          <div className="mt-2 text-xs text-base-content/60 sm:text-sm">
            Estoque ID: {id}
          </div>
        )}
      </div>

      {loading && (
        <div className="text-center text-base-content/70">
          Carregando dashboard...
        </div>
      )}

      {error && (
        <div className="alert alert-error mb-4">
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && dashboard && (
        <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
          {/* Resumo / Info do Estoque */}
          <div className="rounded-box border border-base-300 bg-base-100 p-3 sm:p-4 lg:col-span-2">
            <h2 className="mb-3 text-lg font-semibold sm:text-xl">
              Informações do Estoque
            </h2>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="stats w-full shadow">
                <div className="stat p-3 sm:p-4">
                  <div className="stat-title text-xs sm:text-sm">Nome</div>
                  <div className="stat-value text-xl text-primary sm:text-3xl">
                    {dashboard.stockInfo.name}
                  </div>
                </div>
              </div>
              <div className="stats w-full shadow">
                <div className="stat p-3 sm:p-4">
                  <div className="stat-title text-xs sm:text-sm">Local</div>
                  <div className="stat-value text-xl text-secondary sm:text-3xl">
                    {dashboard.stockInfo.location}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pedidos por Período */}
          <div className="rounded-box border border-base-300 bg-base-100 p-3 sm:p-4">
            <h2 className="mb-3 text-lg font-semibold sm:text-xl">Pedidos</h2>
            <div className="space-y-2">
              {dashboard.ordersByPeriod?.orders && dashboard.ordersByPeriod.orders.length > 0 ? (
                <div className="w-full">
                  <table className="table table-zebra w-full text-xs sm:text-sm">
                    <thead>
                      <tr>
                        <th className="text-xs">Data</th>
                        <th className="text-xs">Status</th>
                        <th className="text-xs hidden sm:table-cell">Seção</th>
                        <th className="text-xs">Itens</th>
                        <th className="text-xs hidden md:table-cell">Retirada</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboard.ordersByPeriod.orders.map((order) => (
                        <tr key={order.id}>
                          <td className="text-xs">
                            {new Date(order.creationDate).toLocaleDateString('pt-BR')}
                          </td>
                          <td>
                            <div className={`badge badge-sm ${
                              order.status === 'completed' ? 'badge-success' :
                              order.status === 'pending' ? 'badge-warning' :
                              order.status === 'cancelled' ? 'badge-error' :
                              'badge-info'
                            }`}>
                              {order.status}
                            </div>
                          </td>
                          <td className="hidden sm:table-cell text-xs">{order.sectionName}</td>
                          <td>
                            <div className="tooltip" data-tip={
                              order.orderItems.map(item => 
                                `${item.merchandiseName} (${item.quantity})`
                              ).join(', ')
                            }>
                              <span className="text-xs">
                                {order.orderItems.length} item(s)
                              </span>
                            </div>
                          </td>
                          <td className="hidden md:table-cell text-xs">
                            {order.withdrawalDate 
                              ? new Date(order.withdrawalDate).toLocaleDateString('pt-BR')
                              : <span className="text-base-content/50">-</span>
                            }
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-xs text-base-content/70 sm:text-sm">
                  Nenhum pedido encontrado para o período selecionado
                </div>
              )}
            </div>
          </div>

          {/* Status de Produtos */}
          <div className="rounded-box border border-base-300 bg-base-100 p-3 sm:p-4">
            <h2 className="mb-3 text-lg font-semibold sm:text-xl">Produtos por Status</h2>
            {dashboard.productStatus ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4">
                  <div className="stats shadow">
                    <div className="stat p-2 sm:p-4">
                      <div className="stat-title text-[10px] sm:text-xs">Total</div>
                      <div className="stat-value text-lg sm:text-2xl">
                        {dashboard.productStatus.total}
                      </div>
                    </div>
                  </div>
                  <div className="stats shadow">
                    <div className="stat p-2 sm:p-4">
                      <div className="stat-title text-[10px] sm:text-xs">Em estoque</div>
                      <div className="stat-value text-success text-lg sm:text-2xl">
                        {dashboard.productStatus.inStock}
                      </div>
                    </div>
                  </div>
                  <div className="stats shadow">
                    <div className="stat p-2 sm:p-4">
                      <div className="stat-title text-[10px] sm:text-xs">Baixo</div>
                      <div className="stat-value text-warning text-lg sm:text-2xl">
                        {dashboard.productStatus.lowStock}
                      </div>
                    </div>
                  </div>
                  <div className="stats shadow">
                    <div className="stat p-2 sm:p-4">
                      <div className="stat-title text-[10px] sm:text-xs">Crítico</div>
                      <div className="stat-value text-error text-lg sm:text-2xl">
                        {dashboard.productStatus.critical}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="divider text-xs sm:text-sm">Por Tipo</div>
                <div className="space-y-2">
                  {dashboard.productStatus.byType?.length ? (
                    dashboard.productStatus.byType.map((item) => (
                      <div
                        key={item.typeName}
                        className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3"
                      >
                        <div className="min-w-0 flex-shrink-0 text-xs text-base-content/70 sm:w-40 sm:text-sm">
                          <span className="truncate block">{item.typeName}</span>
                        </div>
                        <div className="h-2 flex-1 rounded bg-base-200">
                          <div
                            className="h-2 rounded bg-secondary"
                            style={{ width: `${Math.min(100, item.total)}%` }}
                          />
                        </div>
                        <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                          <div className="w-8 text-right text-xs sm:w-12 sm:text-sm">{item.total}</div>
                          <div className="badge badge-success badge-sm">
                            OK: {item.inStock}
                          </div>
                          <div className="badge badge-warning badge-sm">
                            Baixo: {item.lowStock}
                          </div>
                          <div className="badge badge-error badge-sm">
                            Crítico: {item.critical}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-base-content/70 sm:text-sm">
                      Sem dados por tipo
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-xs text-base-content/70 sm:text-sm">Sem dados de status</div>
            )}
          </div>

          {/* Pedidos por Seção */}
          <div className="rounded-box border border-base-300 bg-base-100 p-3 sm:p-4">
            <h2 className="mb-3 text-lg font-semibold sm:text-xl">Pedidos por Seção</h2>
            <div className="space-y-2">
              {dashboard.ordersBySection?.length ? (
                dashboard.ordersBySection.map((item) => (
                  <div key={item.sectionId} className="flex items-center gap-2 sm:gap-3">
                    <div className="min-w-0 flex-1 truncate text-xs text-base-content/70 sm:w-32 sm:flex-none sm:text-sm">
                      {item.sectionName}
                    </div>
                    <div className="h-2 flex-1 rounded bg-base-200">
                      <div
                        className="h-2 rounded bg-accent"
                        style={{ width: `${Math.min(100, item.orderCount)}%` }}
                      />
                    </div>
                    <div className="w-12 text-right text-xs sm:w-16 sm:text-sm">{item.orderCount}</div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-base-content/70 sm:text-sm">Sem dados por seção</div>
              )}
            </div>
          </div>

          {/* Produtos mais Solicitados */}
          <div className="rounded-box border border-base-300 bg-base-100 p-3 sm:p-4">
            <h2 className="mb-3 text-lg font-semibold sm:text-xl">Top Produtos</h2>
            <div className="space-y-2">
              {dashboard.topProducts?.length ? (
                dashboard.topProducts.map((item) => (
                  <div
                    key={item.merchandiseTypeId}
                    className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3"
                  >
                    <div className="min-w-0 truncate text-xs text-base-content/70 sm:w-40 sm:text-sm">
                      {item.name}
                    </div>
                    <div className="h-2 flex-1 rounded bg-base-200">
                      <div
                        className="h-2 rounded bg-info"
                        style={{
                          width: `${Math.min(100, item.totalQuantity)}%`,
                        }}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-12 text-right text-xs sm:w-16 sm:text-sm">{item.totalQuantity}</div>
                      <div className="badge badge-outline badge-sm">
                        Pedidos: {item.orderCount}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-base-content/70 sm:text-sm">
                  Sem dados de top produtos
                </div>
              )}
            </div>
          </div>

          {/* Alertas de Estoque */}
          <div className="rounded-box border border-base-300 bg-base-100 p-3 sm:p-4">
            <h2 className="mb-3 text-lg font-semibold sm:text-xl">Alertas de Estoque</h2>
            <div className="space-y-2">
              {dashboard.stockAlerts?.length ? (
                dashboard.stockAlerts.map((item) => (
                  <div
                    key={item.merchandiseTypeId}
                    className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3"
                  >
                    <div className="min-w-0 flex-1 truncate text-xs text-base-content/70 sm:w-40 sm:flex-none sm:text-sm">
                      {item.name}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="badge badge-outline badge-sm capitalize">
                        {item.status}
                      </div>
                      <div className="text-xs sm:text-sm">Em estoque: {item.inStock}</div>
                      <div className="text-xs sm:text-sm">Mínimo: {item.minimumStock}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-base-content/70 sm:text-sm">
                  Sem alertas de estoque
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockDetails;