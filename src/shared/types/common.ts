export type SortOrder = 'asc' | 'desc';

export interface PaginationMeta {
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface ValidationErrorItem {
  loc?: Array<string | number>;
  msg: string;
  type?: string;
}

export interface ApiErrorResponse {
  detail?: string | ValidationErrorItem[];
  code?: string;
  message?: string;
}
