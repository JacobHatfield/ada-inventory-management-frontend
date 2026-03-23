import { apiRequest } from '../../shared/services/apiClient';
import type { StockSummaryResponse, InventoryItem } from '../../shared/types';

export const dashboardService = {
  /**
   * Get summary of stock status across all inventory items.
   */
  async getStockSummary(): Promise<StockSummaryResponse> {
    return apiRequest<StockSummaryResponse>('/inventory/stock-summary');
  },

  /**
   * Get all items that are at or below their low stock threshold.
   */
  async getLowStockItems(): Promise<InventoryItem[]> {
    return apiRequest<InventoryItem[]>('/inventory/low-stock');
  },
};
