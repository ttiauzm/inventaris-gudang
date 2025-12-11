export interface HistoryItem {
  id: number
  transaction_id: string
  item_name: string
  description: string
  quantity: number
  unit: string
  date: string
  admin_name: string
  admin_id: number
  created_at?: string
}