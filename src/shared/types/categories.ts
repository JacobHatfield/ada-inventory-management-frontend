import type { PaginationMeta } from './common';

export interface Category {
  id: number;
  name: string;
  description: string | null;
  user_id?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CategoryCreateRequest {
  name: string;
  description?: string | null;
}

export interface CategoryUpdateRequest {
  name?: string;
  description?: string | null;
}

export interface CategoryListQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
}

export interface CategoryListResponse {
  items: Category[];
  meta?: PaginationMeta;
}
