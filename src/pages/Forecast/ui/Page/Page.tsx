import { FC } from 'react';
import { BalanceForecastChart } from '@/components/BalanceForecastChart';

const Page: FC = () => {
  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold sm:text-3xl">Previsão de Saldo</h1>
        <p className="text-sm text-base-content/70 sm:text-base">Visualize a previsão para os próximos 6 meses</p>
      </div>
      <BalanceForecastChart months={6} />
    </div>
  );
};

export default Page;