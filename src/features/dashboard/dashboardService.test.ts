import { describe, it, expect, vi, beforeEach } from 'vitest';
import { dashboardService } from './dashboardService';
import { apiRequest } from '../../shared/services/apiClient';

vi.mock('../../shared/services/apiClient', () => ({
  apiRequest: vi.fn(),
}));

describe('dashboardService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getStockSummary calls the correct endpoint and returns data', async () => {
    const mockData = {
      total_items: 10,
      out_of_stock: 1,
      critical_stock: 2,
      low_stock: 3,
      healthy_stock: 4,
    };
    vi.mocked(apiRequest).mockResolvedValueOnce(mockData);

    const result = await dashboardService.getStockSummary();

    expect(apiRequest).toHaveBeenCalledWith('/inventory/stock-summary');
    expect(result).toEqual(mockData);
  });

  it('getLowStockItems calls the correct endpoint and returns data', async () => {
    const mockData = [
      {
        id: 1,
        name: 'Low Item',
        quantity: 1,
        low_stock_threshold: 5,
        description: null,
        category_id: 2,
      },
    ];
    vi.mocked(apiRequest).mockResolvedValueOnce(mockData);

    const result = await dashboardService.getLowStockItems();

    expect(apiRequest).toHaveBeenCalledWith('/inventory/low-stock');
    expect(result).toEqual(mockData);
  });
});
