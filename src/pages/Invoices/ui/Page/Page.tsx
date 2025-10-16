import { FC } from "react";

const Invoices: FC = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Notas Fiscais</h1>
        <p className="text-base-content/70">Gerencie as notas fiscais</p>
      </div>

      <div className="rounded-box border border-base-300 bg-base-100 p-6 shadow">
        <div className="text-center text-base-content/70">
          <span className="text-6xl">📄</span>
          <p className="mt-4">Em breve: gestão de notas fiscais</p>
        </div>
      </div>
    </div>
  );
};

export default Invoices;
