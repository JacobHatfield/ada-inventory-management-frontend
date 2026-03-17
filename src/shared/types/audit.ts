import type { PaginationMeta } from './common';

export interface AuditLogEntry {
  id: number;
  item_id: number;
  user_id: number;
  action: string;
  old_value: Record<string, unknown> | null;
  new_value: Record<string, unknown> | null;
  timestamp: string;
  user_email?: string;
}

export interface AuditListQueryParams {
  page?: number;
  page_size?: number;
}

export interface AuditListResponse {
  items: AuditLogEntry[];
  meta?: PaginationMeta;
}
