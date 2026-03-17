import { apiRequest } from './apiClient';
import type {
  AuditListQueryParams,
  AuditListResponse,
  AuditLogEntry,
  PaginatedResponse,
} from '../types';
import { toQueryString } from '../utils/queryParams';

export const auditService = {
  getItemAudit(
    itemId: number,
    params: AuditListQueryParams = {},
  ): Promise<AuditListResponse | PaginatedResponse<AuditLogEntry>> {
    const query = toQueryString(params as Record<string, unknown>);
    return apiRequest<AuditListResponse | PaginatedResponse<AuditLogEntry>>(
      `/items/${itemId}/audit${query}`,
    );
  },
};
