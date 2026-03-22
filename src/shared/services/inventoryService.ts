import { apiRequest } from './apiClient';
import type {
  InventoryCreateRequest,
  InventoryItem,
  InventoryListQueryParams,
  InventoryListResponse,
  InventoryUpdateRequest,
  PaginatedResponse,
} from '../types';
import { toQueryString } from '../utils/queryParams';

export const inventoryService = {
  list(
    params: InventoryListQueryParams = {},
  ): Promise<InventoryListResponse | PaginatedResponse<InventoryItem>> {
    const query = toQueryString(params as Record<string, unknown>);
    return apiRequest<InventoryListResponse | PaginatedResponse<InventoryItem>>(
      `/inventory/${query}`,
    );
  },

  getById(itemId: number): Promise<InventoryItem> {
    return apiRequest<InventoryItem>(`/inventory/${itemId}`);
  },

  create(payload: InventoryCreateRequest): Promise<InventoryItem> {
    return apiRequest<InventoryItem>('/inventory/', {
      method: 'POST',
      body: payload,
    });
  },

  update(itemId: number, payload: InventoryUpdateRequest): Promise<InventoryItem> {
    return apiRequest<InventoryItem>(`/inventory/${itemId}`, {
      method: 'PUT',
      body: payload,
    });
  },

  remove(itemId: number): Promise<void> {
    return apiRequest<void>(`/inventory/${itemId}`, {
      method: 'DELETE',
    });
  },

  incrementStock(itemId: number, amount = 1): Promise<InventoryItem> {
    return apiRequest<InventoryItem>(`/inventory/${itemId}/increment`, {
      method: 'POST',
      body: { quantity_change: amount },
    });
  },

  decrementStock(itemId: number, amount = 1): Promise<InventoryItem> {
    return apiRequest<InventoryItem>(`/inventory/${itemId}/decrement`, {
      method: 'POST',
      body: { quantity_change: amount },
    });
  },
};
