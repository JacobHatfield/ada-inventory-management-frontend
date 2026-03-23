import { apiRequest } from './apiClient';

export interface AlertCheckResponse {
  success: boolean;
  low_stock_sent: boolean;
  critical_stock_sent: boolean;
  low_stock_count: number;
  critical_stock_count: number;
  message?: string;
}

export const alertService = {
  /**
   * Manually trigger a low stock alert check and send notifications.
   */
  async triggerManualAlertCheck(): Promise<AlertCheckResponse> {
    return apiRequest<AlertCheckResponse>('/inventory/alerts/check', {
      method: 'POST',
    });
  },
};
