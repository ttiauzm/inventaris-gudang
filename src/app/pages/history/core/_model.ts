export interface HistoryItem {
  id: string
  transaction_id: string
  item_name: string
  description: string
  quantity: number
  unit: string
  date: string
  admin_name: string
  admin_id: string
  created_at?: string
}