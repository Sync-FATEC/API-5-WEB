import { createContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { AuthService, AuthUser } from "@/services/authService";

export interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const authService = new AuthService();

  // Verificar se existe usuário logado ao carregar a aplicação
  useEffect(() => {
    const checkAuth = () => {
      try {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const user = await authService.signIn(email, password);
      
      if (user.role == "SOLDADO") {
        return false
      }
      
      setUser(user);
      navigate("/");
      return true;
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.signOut();
      setUser(null);
      navigate("/login");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      // Mesmo com erro, limpar estado local
      setUser(null);
      navigate("/login");
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};