import { describe, it, expect, vi, beforeEach } from 'vitest';
import { alertService } from '@/shared/services/alertService';
import { apiRequest } from '@/shared/services/apiClient';

vi.mock('@/shared/services/apiClient', () => ({
  apiRequest: vi.fn(),
}));

describe('alertService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('triggerManualAlertCheck calls correct endpoint', async () => {
    await alertService.triggerManualAlertCheck();
    expect(apiRequest).toHaveBeenCalledWith('/inventory/alerts/check', expect.objectContaining({
      method: 'POST'
    }));
  });
});
