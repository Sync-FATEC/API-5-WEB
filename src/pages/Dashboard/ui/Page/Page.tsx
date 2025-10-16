import { FC } from "react";

const Dashboard: FC = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-base-content/70">Visão geral do sistema</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="stats shadow">
          <div className="stat">
            <div className="stat-figure text-primary">
              <span className="text-4xl">👥</span>
            </div>
            <div className="stat-title">Total de Usuários</div>
            <div className="stat-value text-primary">--</div>
            <div className="stat-desc">Em breve</div>
          </div>
        </div>

        <div className="stats shadow">
          <div className="stat">
            <div className="stat-figure text-secondary">
              <span className="text-4xl">📄</span>
            </div>
            <div className="stat-title">Notas Fiscais</div>
            <div className="stat-value text-secondary">--</div>
            <div className="stat-desc">Em breve</div>
          </div>
        </div>

        <div className="stats shadow">
          <div className="stat">
            <div className="stat-figure text-accent">
              <span className="text-4xl">📊</span>
            </div>
            <div className="stat-title">Relatórios</div>
            <div className="stat-value text-accent">--</div>
            <div className="stat-desc">Em breve</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
