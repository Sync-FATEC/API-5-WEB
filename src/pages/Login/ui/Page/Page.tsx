import { FC, useState, useEffect } from "react";
import { useAuth } from "@/contexts/useAuth";
import { useNavigate } from "react-router-dom";
import { AuthService } from "@/services/authService";

const Login: FC = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Estados para o modal de esqueceu a senha
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState("");
  const [forgotPasswordError, setForgotPasswordError] = useState("");

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const authService = new AuthService();

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

  const handleForgotPasswordClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowForgotPasswordModal(true);
    setForgotPasswordEmail(formData.email); // Pré-preenche com o email do formulário se houver
    setForgotPasswordMessage("");
    setForgotPasswordError("");
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSendingEmail(true);
    setForgotPasswordError("");
    setForgotPasswordMessage("");

    try {
      const message = await authService.forgotPassword(forgotPasswordEmail);
      setForgotPasswordMessage(message);
    } catch (error: unknown) {
      console.error("Erro ao enviar email de recuperação:", error);
      if (error instanceof Error) {
        setForgotPasswordError(error.message);
      } else {
        setForgotPasswordError("Erro inesperado. Tente novamente.");
      }
    } finally {
      setIsSendingEmail(false);
    }
  };

  const closeForgotPasswordModal = () => {
    setShowForgotPasswordModal(false);
    setForgotPasswordEmail("");
    setForgotPasswordMessage("");
    setForgotPasswordError("");
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
                <button 
                  type="button"
                  onClick={handleForgotPasswordClick}
                  className="label-text-alt link link-hover text-xs sm:text-sm"
                >
                  Esqueceu a senha?
                </button>
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

      {/* Modal de Esqueceu a Senha */}
      {showForgotPasswordModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Recuperar Senha</h3>
            
            <form onSubmit={handleForgotPasswordSubmit}>
              {/* Mensagem de sucesso */}
              {forgotPasswordMessage && (
                <div className="alert alert-success mb-4">
                  <span>{forgotPasswordMessage}</span>
                </div>
              )}

              {/* Mensagem de erro */}
              {forgotPasswordError && (
                <div className="alert alert-error mb-4">
                  <span>{forgotPasswordError}</span>
                </div>
              )}

              {!forgotPasswordMessage && (
                <>
                  <p className="text-sm text-base-content/70 mb-4">
                    Digite seu email para receber as instruções de recuperação de senha.
                  </p>

                  <div className="form-control mb-4">
                    <label className="label">
                      <span className="label-text">Email</span>
                    </label>
                    <input
                      type="email"
                      value={forgotPasswordEmail}
                      onChange={(e) => setForgotPasswordEmail(e.target.value)}
                      placeholder="seu@email.com"
                      className="input input-bordered w-full"
                      required
                    />
                  </div>
                </>
              )}

              <div className="modal-action">
                {!forgotPasswordMessage ? (
                  <>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isSendingEmail || !forgotPasswordEmail.trim()}
                    >
                      {isSendingEmail ? (
                        <span className="flex items-center gap-2">
                          <span className="loading loading-spinner loading-sm"></span>
                          Enviando...
                        </span>
                      ) : (
                        "Enviar Email"
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={closeForgotPasswordModal}
                      className="btn"
                      disabled={isSendingEmail}
                    >
                      Cancelar
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={closeForgotPasswordModal}
                    className="btn btn-primary"
                  >
                    Fechar
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
