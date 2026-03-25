import { describe, it, expect, vi, beforeEach } from 'vitest';
import { auditService } from '@/shared/services/auditService';
import { apiRequest } from '@/shared/services/apiClient';

vi.mock('@/shared/services/apiClient', () => ({
  apiRequest: vi.fn(),
}));

describe('auditService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getItemAudit calls correct endpoint with query string', async () => {
    await auditService.getItemAudit(123, { page: 1, limit: 10 } as any);
    expect(apiRequest).toHaveBeenCalledWith('/items/123/audit?page=1&limit=10');
  });
});
