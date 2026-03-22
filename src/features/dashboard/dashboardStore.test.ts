import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useDashboardStore } from './dashboardStore';
import { dashboardService } from './dashboardService';

vi.mock('./dashboardService', () => ({
  dashboardService: {
    getStockSummary: vi.fn(),
    getLowStockItems: vi.fn(),
  },
}));

describe('dashboardStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('fetches summary successfully', async () => {
    const store = useDashboardStore();
    const mockData = {
      total_items: 10,
      out_of_stock: 1,
      critical_stock: 2,
      low_stock: 3,
      healthy_stock: 4,
    };
    (dashboardService.getStockSummary as any).mockResolvedValueOnce(mockData);

    const fetchPromise = store.fetchSummary();
    expect(store.isLoadingSummary).toBe(true);
    
    await fetchPromise;
    expect(store.isLoadingSummary).toBe(false);
    expect(store.summary).toEqual(mockData);
    expect(store.error).toBeNull();
  });

  it('handles fetch summary error', async () => {
    const store = useDashboardStore();
    (dashboardService.getStockSummary as any).mockRejectedValueOnce({
      response: { data: { detail: 'API Error' } },
    });

    await store.fetchSummary();
    expect(store.isLoadingSummary).toBe(false);
    expect(store.summary).toBeNull();
    expect(store.error).toBe('API Error');
  });

  it('fetches low stock items successfully', async () => {
    const store = useDashboardStore();
    const mockItems = [{ id: 1, name: 'Item', quantity: 2 }];
    (dashboardService.getLowStockItems as any).mockResolvedValueOnce(mockItems);

    const fetchPromise = store.fetchLowStockItems();
    expect(store.isLoadingLowStock).toBe(true);
    
    await fetchPromise;
    expect(store.isLoadingLowStock).toBe(false);
    expect(store.lowStockItems).toEqual(mockItems);
    expect(store.error).toBeNull();
  });
});
