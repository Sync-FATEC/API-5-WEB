import { api, ApiResponse } from '@/shared/api';

export type Period = 'daily' | 'weekly' | 'monthly';

// Novos tipos conforme solicitado
export interface ReportParams {
  stockId: string;
  startDate?: string;
  endDate?: string;
  includeOrders?: boolean;
  includeMerchandise?: boolean;
  includeStock?: boolean;
  period?: Period;
}

export interface DashboardSummary {
  stockInfo: {
    id: string;
    name: string;
    location: string;
  };
  totalOrders: number;
  totalMerchandise: number;
  totalOrderItems: number;
  ordersThisMonth: number;
  ordersByStatus: { [key: string]: number };
  merchandiseByType: { [key: string]: number };
  recentOrders: any[];
  topMerchandise: any[];
}

export interface OrdersByPeriodData {
  period: string; // data, semana ou mês
  count: number;  // quantidade de pedidos
}

export interface ProductStatusData {
  total: number;
  inStock: number;
  lowStock: number;
  critical: number;
  byType: {
    typeName: string;
    total: number;
    inStock: number;
    lowStock: number;
    critical: number;
  }[];
}

export interface OrdersBySectionData {
  sectionId: string;
  sectionName: string;
  orderCount: number;
  percentage: number; // percentual do total de pedidos
}

export interface TopProductsInOrdersData {
  merchandiseTypeId: string;
  name: string;
  totalQuantity: number;
  orderCount: number; // número de pedidos em que aparece
}

export interface StockAlertData {
  merchandiseTypeId: string;
  name: string;
  inStock: number;
  minimumStock: number;
  status: 'normal' | 'low' | 'critical';
}

export interface CompleteDashboardData {
  stockInfo: {
    id: string;
    name: string;
    location: string;
  };
  ordersByPeriod: OrdersByPeriodData[];
  productStatus: ProductStatusData;
  ordersBySection: OrdersBySectionData[];
  topProducts: TopProductsInOrdersData[];
  stockAlerts: StockAlertData[];
}

// Manter compatibilidade com código existente
export type CompleteDashboard = CompleteDashboardData;

function toQuery(params: Record<string, string | number | boolean | undefined>) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });
  return searchParams.toString();
}

export class ReportsService {
  async getCompleteDashboard(stockId: string, opts: { period?: Period; startDate?: string; endDate?: string; includeOrders?: boolean; includeMerchandise?: boolean; includeStock?: boolean }): Promise<CompleteDashboardData> {
    try {
      const qs = toQuery({ stockId, period: opts.period, startDate: opts.startDate, endDate: opts.endDate, includeOrders: opts.includeOrders, includeMerchandise: opts.includeMerchandise, includeStock: opts.includeStock });
      const response = await api.get<ApiResponse<CompleteDashboardData>>(`/reports/dashboard/complete?${qs}`);
      if (response.data.success && response.data.data) {
        return response.data.data as CompleteDashboardData;
      }
      const fallbackMsg = response.data.message || 'Erro ao obter dashboard completo';
      throw new Error(fallbackMsg);
    } catch (error: unknown) {
      console.error('Erro ao obter dashboard completo:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro inesperado ao obter dashboard completo';
      throw new Error(errorMessage);
    }
  }

  async downloadCompleteReport(format: 'pdf' | 'excel', stockId: string, opts: { period?: Period; startDate?: string; endDate?: string; includeOrders?: boolean; includeMerchandise?: boolean; includeStock?: boolean }): Promise<Blob> {
    try {
      const qs = toQuery({ format, stockId, period: opts.period, startDate: opts.startDate, endDate: opts.endDate, includeOrders: opts.includeOrders, includeMerchandise: opts.includeMerchandise, includeStock: opts.includeStock });
      const response = await api.get(`/reports/dashboard/complete/report?${qs}`, { responseType: 'blob' });
      return response.data as Blob;
    } catch (error: unknown) {
      console.error('Erro ao baixar relatório completo:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro inesperado ao baixar relatório';
      throw new Error(errorMessage);
    }
  }

  async getOrdersByPeriod(stockId: string, opts: { period?: Period; startDate?: string; endDate?: string }): Promise<OrdersByPeriodData[]> {
    try {
      const qs = toQuery({ stockId, period: opts.period, startDate: opts.startDate, endDate: opts.endDate });
      const response = await api.get<ApiResponse<OrdersByPeriodData[]>>(`/reports/dashboard/orders-by-period?${qs}`);
      if (response.data.success && Array.isArray(response.data.data)) {
        return response.data.data as OrdersByPeriodData[];
      }
      const fallbackMsg = response.data.message || 'Erro ao obter pedidos por período';
      throw new Error(fallbackMsg);
    } catch (error: unknown) {
      console.error('Erro ao obter pedidos por período:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro inesperado ao obter pedidos por período';
      throw new Error(errorMessage);
    }
  }

  async getProductStatus(stockId: string): Promise<ProductStatusData> {
    try {
      const qs = toQuery({ stockId });
      const response = await api.get<ApiResponse<ProductStatusData>>(`/reports/dashboard/product-status?${qs}`);
      if (response.data.success && response.data.data) {
        return response.data.data as ProductStatusData;
      }
      const fallbackMsg = response.data.message || 'Erro ao obter status de produtos';
      throw new Error(fallbackMsg);
    } catch (error: unknown) {
      console.error('Erro ao obter status de produtos:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro inesperado ao obter status de produtos';
      throw new Error(errorMessage);
    }
  }

  async getOrdersBySection(stockId: string, opts: { startDate?: string; endDate?: string }): Promise<OrdersBySectionData[]> {
    try {
      const qs = toQuery({ stockId, startDate: opts.startDate, endDate: opts.endDate });
      const response = await api.get<ApiResponse<OrdersBySectionData[]>>(`/reports/dashboard/orders-by-section?${qs}`);
      if (response.data.success && Array.isArray(response.data.data)) {
        return response.data.data as OrdersBySectionData[];
      }
      const fallbackMsg = response.data.message || 'Erro ao obter pedidos por seção';
      throw new Error(fallbackMsg);
    } catch (error: unknown) {
      console.error('Erro ao obter pedidos por seção:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro inesperado ao obter pedidos por seção';
      throw new Error(errorMessage);
    }
  }

  async getTopProducts(stockId: string, opts: { startDate?: string; endDate?: string }): Promise<TopProductsInOrdersData[]> {
    try {
      const qs = toQuery({ stockId, startDate: opts.startDate, endDate: opts.endDate });
      const response = await api.get<ApiResponse<TopProductsInOrdersData[]>>(`/reports/dashboard/top-products?${qs}`);
      if (response.data.success && Array.isArray(response.data.data)) {
        return response.data.data as TopProductsInOrdersData[];
      }
      const fallbackMsg = response.data.message || 'Erro ao obter produtos mais solicitados';
      throw new Error(fallbackMsg);
    } catch (error: unknown) {
      console.error('Erro ao obter produtos mais solicitados:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro inesperado ao obter produtos mais solicitados';
      throw new Error(errorMessage);
    }
  }

  async getStockAlerts(stockId: string): Promise<StockAlertData[]> {
    try {
      const qs = toQuery({ stockId });
      const response = await api.get<ApiResponse<StockAlertData[]>>(`/reports/dashboard/stock-alerts?${qs}`);
      if (response.data.success && Array.isArray(response.data.data)) {
        return response.data.data as StockAlertData[];
      }
      const fallbackMsg = response.data.message || 'Erro ao obter alertas de estoque';
      throw new Error(fallbackMsg);
    } catch (error: unknown) {
      console.error('Erro ao obter alertas de estoque:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro inesperado ao obter alertas de estoque';
      throw new Error(errorMessage);
    }
  }
}