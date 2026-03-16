import { apiRequest } from './apiClient'
import type {
  InventoryCreateRequest,
  InventoryItem,
  InventoryListQueryParams,
  InventoryListResponse,
  InventoryStockUpdateRequest,
  InventoryUpdateRequest,
  PaginatedResponse,
} from '../types'
import { toQueryString } from '../utils/queryParams'

export const inventoryService = {
  list(params: InventoryListQueryParams = {}): Promise<InventoryListResponse | PaginatedResponse<InventoryItem>> {
    const query = toQueryString(params as Record<string, unknown>)
    return apiRequest<InventoryListResponse | PaginatedResponse<InventoryItem>>(`/items${query}`)
  },

  getById(itemId: number): Promise<InventoryItem> {
    return apiRequest<InventoryItem>(`/items/${itemId}`)
  },

  create(payload: InventoryCreateRequest): Promise<InventoryItem> {
    return apiRequest<InventoryItem>('/items', {
      method: 'POST',
      body: payload,
    })
  },

  update(itemId: number, payload: InventoryUpdateRequest): Promise<InventoryItem> {
    return apiRequest<InventoryItem>(`/items/${itemId}`, {
      method: 'PATCH',
      body: payload,
    })
  },

  remove(itemId: number): Promise<void> {
    return apiRequest<void>(`/items/${itemId}`, {
      method: 'DELETE',
    })
  },

  incrementStock(itemId: number, amount = 1): Promise<InventoryItem> {
    const payload: InventoryStockUpdateRequest = { amount }
    return apiRequest<InventoryItem>(`/items/${itemId}/stock/increment`, {
      method: 'PATCH',
      body: payload,
    })
  },

  decrementStock(itemId: number, amount = 1): Promise<InventoryItem> {
    const payload: InventoryStockUpdateRequest = { amount }
    return apiRequest<InventoryItem>(`/items/${itemId}/stock/decrement`, {
      method: 'PATCH',
      body: payload,
    })
  },
}
