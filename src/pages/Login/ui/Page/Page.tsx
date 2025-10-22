import { FC, useState, useEffect } from "react";
import { useAuth } from "@/contexts/useAuth";
import { useNavigate } from "react-router-dom";

const Login: FC = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Se já estiver logado, redireciona para dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpa erro quando usuário digita
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      const success = await login(formData.email, formData.password);
      if (!success) {
        setError("Erro ao fazer login. Verifique suas credenciais.");
      }
    } catch (error: unknown) {
      console.error("Erro ao fazer login:", error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Erro inesperado. Tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-base-200 sm:p-6">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center sm:mb-8">
          {/* Logo */}
          <div className="mb-4 flex justify-center sm:mb-6">
            <img 
              src="/images/logo.svg" 
              alt="Logo" 
              className="h-16 w-auto object-contain sm:h-24"
            />
          </div>
          
          <h1 className="text-2xl font-bold sm:text-3xl">Fazer Login</h1>
          <p className="text-sm text-base-content/70 sm:text-base">Acesse sua conta</p>
        </div>

        <div className="rounded-box border border-base-300 bg-base-100 p-4 shadow sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            {/* Mensagem de erro */}
            {error && (
              <div className="alert alert-error">
                <span>{error}</span>
              </div>
            )}

            {/* Campo Email */}
            <div className="form-control">
              <label className="label">
                <span className="label-text text-sm font-medium sm:text-base">Email</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="seu@email.com"
                className="input input-bordered input-sm w-full sm:input-md"
                required
              />
            </div>

            {/* Campo Senha */}
            <div className="form-control">
              <label className="label">
                <span className="label-text text-sm font-medium sm:text-base">Senha</span>
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Digite sua senha"
                className="input input-bordered input-sm w-full sm:input-md"
                required
              />
              <label className="label">
                <a href="#" className="label-text-alt link link-hover text-xs sm:text-sm">
                  Esqueceu a senha?
                </a>
              </label>
            </div>

            {/* Botão de Login */}
            <div className="form-control mt-4 sm:mt-6">
              <button
                type="submit"
                className="btn btn-primary btn-sm w-full sm:btn-md"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="loading loading-spinner loading-xs sm:loading-sm"></span>
                    <span className="text-xs sm:text-sm">Entrando...</span>
                  </span>
                ) : (
                  <span className="text-xs sm:text-sm">Entrar</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
