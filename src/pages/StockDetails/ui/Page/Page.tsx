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
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard do Estoque</h1>
          <p className="text-base-content/70">
            Visualização consolidada para o estoque selecionado
          </p>
        </div>
        <Link to="/stocks" className="btn-outline btn">
          Voltar
        </Link>
      </div>

      {/* Filtros */}
      <div className="rounded-box mb-6 border border-base-300 bg-base-100 p-4">
        <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-2 lg:grid-cols-5">
          <div>
            <label className="label">
              <span className="label-text">Início</span>
            </label>
            <input
              type="date"
              className="input-bordered input w-full"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <label className="label">
              <span className="label-text">Fim</span>
            </label>
            <input
              type="date"
              className="input-bordered input w-full"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <button
            className="btn-primary btn w-full md:w-auto"
            onClick={fetchDashboard}
          >
            Atualizar
          </button>
          <button
            className="btn w-full md:w-auto"
            onClick={() => handleDownload("pdf")}
          >
            Baixar PDF
          </button>
          <button
            className="btn w-full md:w-auto"
            onClick={() => handleDownload("excel")}
          >
            Baixar Excel
          </button>
        </div>
        {id && (
          <div className="mt-2 text-sm text-base-content/60">
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
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Resumo / Info do Estoque */}
          <div className="rounded-box border border-base-300 bg-base-100 p-4 lg:col-span-2">
            <h2 className="mb-3 text-xl font-semibold">
              Informações do Estoque
            </h2>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="stats w-full shadow">
                <div className="stat">
                  <div className="stat-title">Nome</div>
                  <div className="stat-value text-3xl text-primary">
                    {dashboard.stockInfo.name}
                  </div>
                </div>
              </div>
              <div className="stats w-full shadow">
                <div className="stat">
                  <div className="stat-title">Local</div>
                  <div className="stat-value text-3xl text-secondary">
                    {dashboard.stockInfo.location}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pedidos por Período */}
          <div className="rounded-box border border-base-300 bg-base-100 p-4">
            <h2 className="mb-3 text-xl font-semibold">Pedidos</h2>
            <div className="space-y-2">
              {dashboard.ordersByPeriod?.orders && dashboard.ordersByPeriod.orders.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="table table-zebra w-full">
                    <thead>
                      <tr>
                        <th>Data Criação</th>
                        <th>Status</th>
                        <th>Seção</th>
                        <th>Itens</th>
                        <th>Data Retirada</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboard.ordersByPeriod.orders.map((order) => (
                        <tr key={order.id}>
                          <td>
                            {new Date(order.creationDate).toLocaleDateString('pt-BR')}
                          </td>
                          <td>
                            <div className={`badge ${
                              order.status === 'completed' ? 'badge-success' :
                              order.status === 'pending' ? 'badge-warning' :
                              order.status === 'cancelled' ? 'badge-error' :
                              'badge-info'
                            }`}>
                              {order.status}
                            </div>
                          </td>
                          <td>{order.sectionName}</td>
                          <td>
                            <div className="tooltip" data-tip={
                              order.orderItems.map(item => 
                                `${item.merchandiseName} (${item.quantity})`
                              ).join(', ')
                            }>
                              <span className="tooltip">
                                {order.orderItems.length} item(s)
                              </span>
                            </div>
                          </td>
                          <td>
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
                <div className="text-base-content/70">
                  Nenhum pedido encontrado para o período selecionado
                </div>
              )}
            </div>
          </div>

          {/* Status de Produtos */}
          <div className="rounded-box border border-base-300 bg-base-100 p-4">
            <h2 className="mb-3 text-xl font-semibold">Produtos por Status</h2>
            {dashboard.productStatus ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                  <div className="stats shadow">
                    <div className="stat">
                      <div className="stat-title">Total</div>
                      <div className="stat-value">
                        {dashboard.productStatus.total}
                      </div>
                    </div>
                  </div>
                  <div className="stats shadow">
                    <div className="stat">
                      <div className="stat-title">Em estoque</div>
                      <div className="stat-value text-success">
                        {dashboard.productStatus.inStock}
                      </div>
                    </div>
                  </div>
                  <div className="stats shadow">
                    <div className="stat">
                      <div className="stat-title">Baixo</div>
                      <div className="stat-value text-warning">
                        {dashboard.productStatus.lowStock}
                      </div>
                    </div>
                  </div>
                  <div className="stats shadow">
                    <div className="stat">
                      <div className="stat-title">Crítico</div>
                      <div className="stat-value text-error">
                        {dashboard.productStatus.critical}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="divider">Por Tipo</div>
                <div className="space-y-2">
                  {dashboard.productStatus.byType?.length ? (
                    dashboard.productStatus.byType.map((item) => (
                      <div
                        key={item.typeName}
                        className="flex items-center gap-3"
                      >
                        <div className="w-56 text-sm text-base-content/70">
                          {item.typeName}
                        </div>
                        <div className="h-2 flex-1 rounded bg-base-200">
                          <div
                            className="h-2 rounded bg-secondary"
                            style={{ width: `${Math.min(100, item.total)}%` }}
                          />
                        </div>
                        <div className="w-12 text-right">{item.total}</div>
                        <div className="badge badge-success">
                          OK: {item.inStock}
                        </div>
                        <div className="badge badge-warning">
                          Baixo: {item.lowStock}
                        </div>
                        <div className="badge badge-error">
                          Crítico: {item.critical}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-base-content/70">
                      Sem dados por tipo
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-base-content/70">Sem dados de status</div>
            )}
          </div>

          {/* Pedidos por Seção */}
          <div className="rounded-box border border-base-300 bg-base-100 p-4">
            <h2 className="mb-3 text-xl font-semibold">Pedidos por Seção</h2>
            <div className="space-y-2">
              {dashboard.ordersBySection?.length ? (
                dashboard.ordersBySection.map((item) => (
                  <div key={item.sectionId} className="flex items-center gap-3">
                    <div className="w-40 text-sm text-base-content/70">
                      {item.sectionName}
                    </div>
                    <div className="h-2 flex-1 rounded bg-base-200">
                      <div
                        className="h-2 rounded bg-accent"
                        style={{ width: `${Math.min(100, item.orderCount)}%` }}
                      />
                    </div>
                    <div className="w-20 text-right">{item.orderCount}</div>
                  </div>
                ))
              ) : (
                <div className="text-base-content/70">Sem dados por seção</div>
              )}
            </div>
          </div>

          {/* Produtos mais Solicitados */}
          <div className="rounded-box border border-base-300 bg-base-100 p-4">
            <h2 className="mb-3 text-xl font-semibold">Top Produtos</h2>
            <div className="space-y-2">
              {dashboard.topProducts?.length ? (
                dashboard.topProducts.map((item) => (
                  <div
                    key={item.merchandiseTypeId}
                    className="flex items-center gap-3"
                  >
                    <div className="w-56 text-sm text-base-content/70">
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
                    <div className="w-20 text-right">{item.totalQuantity}</div>
                    <div className="badge badge-outline ml-2">
                      Pedidos: {item.orderCount}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-base-content/70">
                  Sem dados de top produtos
                </div>
              )}
            </div>
          </div>

          {/* Alertas de Estoque */}
          <div className="rounded-box border border-base-300 bg-base-100 p-4">
            <h2 className="mb-3 text-xl font-semibold">Alertas de Estoque</h2>
            <div className="space-y-2">
              {dashboard.stockAlerts?.length ? (
                dashboard.stockAlerts.map((item) => (
                  <div
                    key={item.merchandiseTypeId}
                    className="flex items-center gap-3"
                  >
                    <div className="w-56 text-sm text-base-content/70">
                      {item.name}
                    </div>
                    <div className="badge badge-outline capitalize">
                      {item.status}
                    </div>
                    <div className="ml-auto">Em estoque: {item.inStock}</div>
                    <div className="ml-4">Mínimo: {item.minimumStock}</div>
                  </div>
                ))
              ) : (
                <div className="text-base-content/70">
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