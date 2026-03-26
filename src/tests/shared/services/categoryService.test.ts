import { describe, it, expect, vi, beforeEach } from 'vitest';
import { categoryService } from '@/shared/services/categoryService';
import { apiRequest } from '@/shared/services/apiClient';

vi.mock('@/shared/services/apiClient', () => ({
  apiRequest: vi.fn(),
}));

describe('categoryService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('list calls correct endpoint', async () => {
    await categoryService.list({ search: 'cat' });
    expect(apiRequest).toHaveBeenCalledWith('/categories/?search=cat');
  });

  it('getById calls correct endpoint', async () => {
    await categoryService.getById(1);
    expect(apiRequest).toHaveBeenCalledWith('/categories/1');
  });

  it('create calls correct endpoint', async () => {
    const payload = { name: 'New Cat' };
    await categoryService.create(payload as any);
    expect(apiRequest).toHaveBeenCalledWith(
      '/categories/',
      expect.objectContaining({
        method: 'POST',
        body: payload,
      }),
    );
  });

  it('update calls correct endpoint', async () => {
    const payload = { name: 'Updated' };
    await categoryService.update(1, payload as any);
    expect(apiRequest).toHaveBeenCalledWith(
      '/categories/1',
      expect.objectContaining({
        method: 'PUT',
        body: payload,
      }),
    );
  });

  it('remove calls correct endpoint', async () => {
    await categoryService.remove(1);
    expect(apiRequest).toHaveBeenCalledWith(
      '/categories/1',
      expect.objectContaining({
        method: 'DELETE',
      }),
    );
  });
});
