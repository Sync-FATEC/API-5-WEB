import { FC } from "react";

const Home: FC = () => {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center p-6">
      <div className="text-center">
        <h1 className="mb-4 text-5xl font-bold">Bem-vindo ao Sistema</h1>
        <p className="mb-8 text-xl text-base-content/70">
          Utilize a navegação lateral para acessar as funcionalidades
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <a href="/dashboard" className="btn btn-primary btn-lg">
            📊 Ver Dashboard
          </a>
          <a href="/users" className="btn btn-outline btn-lg">
            👥 Gerenciar Usuários
          </a>
        </div>
      </div>
    </div>
  );
};

export default Home;
