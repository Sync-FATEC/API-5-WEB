import { FC, useEffect, useMemo, useState } from 'react';
import { ReportsService } from '@/services/reportsService';

type Props = { months?: number };

const BalanceForecastChart: FC<Props> = ({ months = 6 }) => {
  const [labels, setLabels] = useState<string[]>([]);
  const [values, setValues] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const max = useMemo(() => values.reduce((a, b) => (a > b ? a : b), 0), [values]);
  const min = useMemo(() => values.reduce((a, b) => (a < b ? a : b), values[0] ?? 0), [values]);
  const range = useMemo(() => {
    const r = max - min;
    return r === 0 ? 1 : r;
  }, [max, min]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const svc = new ReportsService();
      const res = await svc.getBalanceForecast(months);
      setLabels(res.labels);
      setValues(res.predictions);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro ao obter previsão');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const width = 700;
  const height = 320;
  const paddingLeft = 100;  // Aumentar esse valor move o gráfico para direita
  const paddingRight = 28;
  const paddingTop = 28;
  const paddingBottom = 28;
  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;
  const stepX = values.length > 1 ? chartWidth / (values.length - 1) : chartWidth;

  const points = values.map((v, i) => {
    const x = paddingLeft + i * stepX;
    const y = height - paddingBottom - ((v - min) / range) * chartHeight;
    return `${x},${y}`;
  });

  const currency = useMemo(() => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }), []);
  const yTicks = useMemo(() => {
    const ticks = 5;
    const arr: number[] = [];
    for (let i = 0; i <= ticks; i++) arr.push(min + (range * i) / ticks);
    return arr;
  }, [min, range]);

  return (
    <div className="rounded-box border border-base-300 bg-base-100 p-4">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl font-semibold">Previsão de Saldo</h3>
          <p className="text-sm text-base-content/70">Visualize a previsão para os próximos 6 meses</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn btn-sm" onClick={fetchData} disabled={loading}>
            {loading ? 'Atualizando...' : 'Atualizar'}
          </button>
        </div>
      </div>
      {error && (
        <div className="alert alert-error mb-2"><span>{error}</span></div>
      )}
      <svg width={width} height={height} className="w-full">
        <line x1={paddingLeft} y1={height - paddingBottom} x2={width - paddingRight} y2={height - paddingBottom} stroke="#ccc" />
        <line x1={paddingLeft} y1={paddingTop} x2={paddingLeft} y2={height - paddingBottom} stroke="#ccc" />
        {yTicks.map((t, i) => {
          const y = height - paddingBottom - ((t - min) / range) * chartHeight;
          return (
            <g key={i}>
              <line x1={paddingLeft} y1={y} x2={width - paddingRight} y2={y} stroke="#e5e7eb" />
              <text x={paddingLeft - 8} y={y} textAnchor="end" dominantBaseline="middle" className="fill-base-content/60 text-xs">{currency.format(t)}</text>
            </g>
          );
        })}
        <polyline points={points.join(' ')} fill="none" stroke="#2563eb" strokeWidth="2" />
        {values.map((v, i) => {
          const x = paddingLeft + i * stepX;
          const y = height - paddingBottom - ((v - min) / range) * chartHeight;
          return (
            <circle key={i} cx={x} cy={y} r={3} fill="#2563eb" onMouseEnter={() => setHoverIdx(i)} onMouseLeave={() => setHoverIdx(null)} />
          );
        })}
      </svg>
      <div className="mt-2 grid grid-cols-2 gap-3 text-xs sm:text-sm">
        <div className="space-y-1">
          <div className="font-medium">Meses</div>
          <div className="flex flex-wrap gap-2 text-base-content/70">
            {labels.map((l) => (
              <span key={l}>{l}</span>
            ))}
          </div>
        </div>
        <div className="space-y-1">
          <div className="font-medium">Valores</div>
          <div className="flex flex-wrap gap-2 text-base-content/70">
            {values.map((v, i) => (
              <span key={i}>{currency.format(v)}</span>
            ))}
          </div>
        </div>
      </div>
      {hoverIdx !== null && (
        <div className="mt-2 alert alert-info p-2 text-xs sm:text-sm">
          <span>{labels[hoverIdx]}: {currency.format(values[hoverIdx])}</span>
        </div>
      )}
    </div>
  );
};

export default BalanceForecastChart;