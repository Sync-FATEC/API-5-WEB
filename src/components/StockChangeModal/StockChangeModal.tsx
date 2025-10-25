import { FC, useState, useEffect } from "react";
import { AuthService, UserStock } from "@/services/authService";
import { StockServices, Stock } from "@/services/stockServices";
import { useAuth } from "@/contexts/useAuth";

interface StockManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
  userStocks: UserStock[];
  onSuccess: () => void;
}

export const StockChangeModal: FC<StockManagementModalProps> = ({
  isOpen,
  onClose,
  userId,
  userName,
  userStocks,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [availableStocks, setAvailableStocks] = useState<Stock[]>([]);
  const [selectedStockId, setSelectedStockId] = useState<string>("");
  const [responsibility, setResponsibility] = useState<'SOLDADO' | 'SUPERVISOR' | 'ADMIN'>('SOLDADO');
  const [loading, setLoading] = useState(false);
  const [loadingStocks, setLoadingStocks] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchAvailableStocks();
    }
  }, [isOpen, user?.id, userStocks]);

  const fetchAvailableStocks = async () => {
    if (!user?.id) return;
    
    setLoadingStocks(true);
    setError(null);
    
    try {
      const stockService = new StockServices();
      const allStocks = await stockService.listStock(user.id);
      
      // Filtrar estoques que o usuário ainda não possui
      const userStockIds = userStocks.map((stock: UserStock) => stock.stockId);
      const available = allStocks.filter((stock: Stock) => !userStockIds.includes(stock.id));
      
      setAvailableStocks(available);
    } catch (err) {
      console.error("Erro ao buscar estoques:", err);
      setError(err instanceof Error ? err.message : "Erro ao carregar estoques");
    } finally {
      setLoadingStocks(false);
    }
  };

  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedStockId) {
      setError("Por favor, selecione um estoque");
      return;
    }

    if (!user?.id) {
      setError("Usuário não autenticado");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const authService = new AuthService();
      await authService.linkUserToStock(userId, selectedStockId, responsibility);
      
      onSuccess();
      resetForm();
      onClose();
    } catch (err) {
      console.error("Erro ao adicionar usuário ao estoque:", err);
      setError(err instanceof Error ? err.message : "Erro ao adicionar usuário ao estoque");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveStock = async (stockId: string) => {
    if (!user?.id) {
      setError("Usuário não autenticado");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const authService = new AuthService();
      await authService.unlinkUserFromStock(userId, stockId);
      
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Erro ao remover usuário do estoque:", err);
      setError(err instanceof Error ? err.message : "Erro ao remover usuário do estoque");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedStockId("");
    setResponsibility('SOLDADO');
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Gerenciar Estoques - {userName}
              </h2>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            {/* Estoques atuais do usuário */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Estoques Atuais</h3>
              {userStocks.length === 0 ? (
                <p className="text-gray-500 text-sm">Usuário não está vinculado a nenhum estoque.</p>
              ) : (
                <div className="space-y-2">
                  {userStocks.map((stock) => (
                    <div key={stock.stockId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{stock.stockName}</p>
                        <p className="text-sm text-gray-600">Responsabilidade: {stock.responsibility}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveStock(stock.stockId)}
                        disabled={loading}
                        className="px-3 py-1 text-sm font-medium text-red-600 bg-red-100 border border-red-300 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? "Removendo..." : "Remover"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Adicionar novo estoque */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Adicionar Novo Estoque</h3>
              
              {loadingStocks ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="ml-2 text-sm text-gray-500">Carregando estoques disponíveis...</p>
                </div>
              ) : availableStocks.length === 0 ? (
                <p className="text-gray-500 text-sm">Não há estoques disponíveis para adicionar.</p>
              ) : (
                <form onSubmit={handleAddStock}>
                  <div className="mb-4">
                    <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-2">
                      Estoque
                    </label>
                    <select
                      id="stock"
                      value={selectedStockId}
                      onChange={(e) => setSelectedStockId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={loading}
                      required
                    >
                      <option value="">Selecione um estoque</option>
                      {availableStocks.map((stock) => (
                        <option key={stock.id} value={stock.id}>
                          {stock.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="responsibility" className="block text-sm font-medium text-gray-700 mb-2">
                      Responsabilidade
                    </label>
                    <select
                      id="responsibility"
                      value={responsibility}
                      onChange={(e) => setResponsibility(e.target.value as 'SOLDADO' | 'SUPERVISOR' | 'ADMIN')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={loading}
                      required
                    >
                      <option value="SOLDADO">Soldado</option>
                      <option value="SUPERVISOR">Supervisor</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                      disabled={loading}
                    >
                      Fechar
                    </button>
                    <button
                      type="submit"
                      disabled={loading || !selectedStockId}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Adicionando...
                        </div>
                      ) : (
                        "Adicionar Estoque"
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};