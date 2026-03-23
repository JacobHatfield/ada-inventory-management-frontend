import { defineStore } from 'pinia';
import { dashboardService } from './dashboardService';
import type { StockSummaryResponse } from '@/shared/types/dashboard';
import type { InventoryItem } from '@/shared/types/inventory';

export const useDashboardStore = defineStore('dashboard', {
  state: () => ({
    summary: null as StockSummaryResponse | null,
    lowStockItems: [] as InventoryItem[],
    isLoadingSummary: false,
    isLoadingLowStock: false,
    error: null as string | null,
  }),

  actions: {
    async fetchSummary() {
      this.isLoadingSummary = true;
      this.error = null;
      try {
        const data = await dashboardService.getStockSummary();
        this.summary = data;
      } catch (err: unknown) {
        this.error = err instanceof Error ? err.message : 'Failed to fetch dashboard summary.';
        console.error('Error fetching dashboard summary:', err);
      } finally {
        this.isLoadingSummary = false;
      }
    },

    async fetchLowStockItems() {
      this.isLoadingLowStock = true;
      this.error = null;
      try {
        const data = await dashboardService.getLowStockItems();
        this.lowStockItems = data;
      } catch (err: unknown) {
        this.error = err instanceof Error ? err.message : 'Failed to fetch low stock items.';
        console.error('Error fetching low stock items:', err);
      } finally {
        this.isLoadingLowStock = false;
      }
    },

    clearError() {
      this.error = null;
    },
  },
});
