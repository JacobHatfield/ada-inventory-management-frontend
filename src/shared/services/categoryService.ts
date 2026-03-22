import { apiRequest } from './apiClient';
import type {
  Category,
  CategoryCreateRequest,
  CategoryListQueryParams,
  CategoryListResponse,
  CategoryUpdateRequest,
  PaginatedResponse,
} from '../types';
import { toQueryString } from '../utils/queryParams';

export const categoryService = {
  list(
    params: CategoryListQueryParams = {},
  ): Promise<CategoryListResponse | PaginatedResponse<Category>> {
    const query = toQueryString(params as Record<string, unknown>);
    return apiRequest<CategoryListResponse | PaginatedResponse<Category>>(`/categories/${query}`);
  },

  create(payload: CategoryCreateRequest): Promise<Category> {
    return apiRequest<Category>('/categories/', {
      method: 'POST',
      body: payload,
    });
  },

  getById(categoryId: number): Promise<Category> {
    return apiRequest<Category>(`/categories/${categoryId}`);
  },

  update(categoryId: number, payload: CategoryUpdateRequest): Promise<Category> {
    return apiRequest<Category>(`/categories/${categoryId}`, {
      method: 'PUT',
      body: payload,
    });
  },

  remove(categoryId: number): Promise<void> {
    return apiRequest<void>(`/categories/${categoryId}`, {
      method: 'DELETE',
    });
  },
};
