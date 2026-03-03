export interface LogItem {
  id: string
  transaction_id: string
  user_id: string
  item_name: string
  description: string
  quantity: number
  table_name: string
  row_id: string
  date: string
  admin_name: string
  action: 'create' | 'update' | 'delete'
}