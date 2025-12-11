import API from '../../../../api'
import {InventoryItem, InventoryResponse} from './_model'

const INVENTORY_URL = '/inventory'

// Get all inventory
export const getInventory = async (params?: {
  page?: number
  per_page?: number
  search?: string
  category?: string
}): Promise<InventoryItem[]> => {
  const response = await API.get<InventoryResponse>(INVENTORY_URL, {params})
  return response.data.data
}

// Get single inventory item
export const getInventoryById = async (id: number): Promise<InventoryItem> => {
  const response = await API.get<{data: InventoryItem}>(`${INVENTORY_URL}/${id}`)
  return response.data.data
}

// Create inventory
export const createInventory = async (data: Partial<InventoryItem>): Promise<InventoryItem> => {
  const response = await API.post<{data: InventoryItem}>(INVENTORY_URL, data)
  return response.data.data
}

// Update inventory
export const updateInventory = async (id: number, data: Partial<InventoryItem>): Promise<InventoryItem> => {
  const response = await API.put<{data: InventoryItem}>(`${INVENTORY_URL}/${id}`, data)
  return response.data.data
}

// Delete inventory
export const deleteInventory = async (id: number): Promise<void> => {
  await API.delete(`${INVENTORY_URL}/${id}`)
}

// Upload inventory image
export const uploadInventoryImage = async (id: number, file: File): Promise<string> => {
  const formData = new FormData()
  formData.append('image', file)
  
  const response = await API.post<{data: {url: string}}>(`${INVENTORY_URL}/${id}/image`, formData, {
    headers: {'Content-Type': 'multipart/form-data'}
  })
  
  return response.data.data.url
}