import { api } from '@/shared/services/api';
import type { StockSummaryResponse } from '@/shared/types/dashboard';
import type { InventoryItem } from '@/shared/types/inventory';

const BASE_PATH = '/api/v1/inventory';

export const dashboardService = {
  /**
   * Get summary of stock status across all inventory items.
   */
  async getStockSummary(): Promise<StockSummaryResponse> {
    const { data } = await api.get<StockSummaryResponse>(`${BASE_PATH}/stock-summary`);
    return data;
  },

  /**
   * Get items that are below their minimum threshold.
   */
  async getLowStockItems(): Promise<InventoryItem[]> {
    const { data } = await api.get<InventoryItem[]>(`${BASE_PATH}/low-stock`);
    return data;
  },
};
