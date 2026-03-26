export interface StockSummaryResponse {
  total_items: number;
  out_of_stock: number;
  critical_stock: number;
  low_stock: number;
  healthy_stock: number;
}
