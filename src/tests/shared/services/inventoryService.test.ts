import { describe, it, expect, vi, beforeEach } from 'vitest';
import { inventoryService } from '@/shared/services/inventoryService';
import { apiRequest } from '@/shared/services/apiClient';

vi.mock('@/shared/services/apiClient', () => ({
  apiRequest: vi.fn(),
}));

describe('inventoryService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('list calls correct endpoint with query string', async () => {
    await inventoryService.list({ search: 'test', page: 2 });
    expect(apiRequest).toHaveBeenCalledWith('/inventory/?search=test&page=2');
  });

  it('getById calls correct endpoint', async () => {
    await inventoryService.getById(123);
    expect(apiRequest).toHaveBeenCalledWith('/inventory/123');
  });

  it('create calls correct endpoint', async () => {
    const payload = { name: 'Item', quantity: 10 };
    await inventoryService.create(payload as any);
    expect(apiRequest).toHaveBeenCalledWith(
      '/inventory/',
      expect.objectContaining({
        method: 'POST',
        body: payload,
      }),
    );
  });

  it('update calls correct endpoint', async () => {
    const payload = { quantity: 20 };
    await inventoryService.update(123, payload as any);
    expect(apiRequest).toHaveBeenCalledWith(
      '/inventory/123',
      expect.objectContaining({
        method: 'PUT',
        body: payload,
      }),
    );
  });

  it('remove calls correct endpoint', async () => {
    await inventoryService.remove(123);
    expect(apiRequest).toHaveBeenCalledWith(
      '/inventory/123',
      expect.objectContaining({
        method: 'DELETE',
      }),
    );
  });

  it('incrementStock calls correct endpoint', async () => {
    await inventoryService.incrementStock(123, 5);
    expect(apiRequest).toHaveBeenCalledWith(
      '/inventory/123/increment',
      expect.objectContaining({
        method: 'POST',
        body: { quantity_change: 5 },
      }),
    );
  });

  it('getAuditHistory calls correct endpoint with query string', async () => {
    await inventoryService.getAuditHistory(123, { page: 1 });
    expect(apiRequest).toHaveBeenCalledWith('/inventory/123/audit-history?page=1');
  });
});
