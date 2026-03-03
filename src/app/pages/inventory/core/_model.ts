export interface InventoryItem {
  id: string
  name: string
  description?: string
  supplier: string
  supplier_id?: string
  quantity: number
  unit: string
  price?: number
  image?: string
  category?: string
  material?: string
  created_at?: string
  updated_at?: string
}

export interface InventoryResponse {
  data: any[]
}