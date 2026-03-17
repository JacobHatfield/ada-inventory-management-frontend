import type { SortOrder, PaginationMeta } from './common';

export type StockLevel = 'low' | 'medium' | 'high';

export interface InventoryCategorySummary {
  id: number;
  name: string;
}

export interface InventoryItem {
  id: number;
  name: string;
  description: string | null;
  quantity: number;
  low_stock_threshold: number;
  category_id: number | null;
  user_id?: number;
  created_at?: string;
  updated_at?: string;
  is_low_stock?: boolean;
  category?: InventoryCategorySummary | null;
}

export interface InventoryCreateRequest {
  name: string;
  description?: string | null;
  quantity: number;
  low_stock_threshold?: number;
  category_id?: number | null;
}

export interface InventoryUpdateRequest {
  name?: string;
  description?: string | null;
  quantity?: number;
  low_stock_threshold?: number;
  category_id?: number | null;
}

export interface InventoryStockUpdateRequest {
  amount: number;
}

export interface InventoryListQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  category_id?: number;
  stock_level?: StockLevel;
  sort_by?: 'name' | 'quantity' | 'created_at' | 'updated_at';
  sort_order?: SortOrder;
}

export interface InventoryListResponse {
  items: InventoryItem[];
  meta?: PaginationMeta;
}
