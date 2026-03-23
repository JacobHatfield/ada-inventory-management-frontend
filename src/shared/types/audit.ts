export interface AuditLog {
  id: number;
  inventory_item_id: number;
  user_id: number;
  action: string;
  field_name: string | null;
  old_value: string | null;
  new_value: string | null;
  timestamp: string;
}

export interface AuditListQueryParams {
  page?: number;
  page_size?: number;
}
