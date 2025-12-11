export interface InventoryItem {
  id: number
  name: string
  description?: string
  supplier: string
  quantity: number
  unit: string
  price?: number
  image?: string
  category?: string
  created_at?: string
  updated_at?: string
}

export interface InventoryResponse {
  data: InventoryItem[]
  meta?: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}