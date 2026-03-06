import API from '../../../../api'
import { InventoryItem, InventoryResponse } from './_model'

const ITEMS_URL = '/items'

// Get all inventory
export const getInventory = async (params?: {
  page?: number
  per_page?: number
  search?: string
  category?: string
}): Promise<InventoryItem[]> => {
  const response = await API.get<InventoryResponse>(ITEMS_URL, { params })
  return response.data.data.map((item: any) => ({
    id: item.item_id,
    name: item.item_name,
    category: item.categories?.category_name || '',
    material: item.materials?.material_name || '',
    supplier: item.suppliers && item.suppliers.length > 0 ? item.suppliers[0].supplier_name : '',
    supplier_id: item.suppliers && item.suppliers.length > 0 ? item.suppliers[0].supplier_id : undefined,
    quantity: item.quantity,
    unit: item.unit,
    price: item.price,
    description: item.materials?.material_name || '',
    created_at: item.created_at,
    updated_at: item.updated_at
  }))
}

// Get single inventory item
export const getInventoryById = async (id: string): Promise<InventoryItem> => {
  const response = await API.get<{ data: any }>(`${ITEMS_URL}/${id}`)
  const item = response.data.data
  return {
    id: item.item_id,
    name: item.item_name,
    category: item.categories?.category_name || '',
    material: item.materials?.material_name || '',
    supplier: item.suppliers && item.suppliers.length > 0 ? item.suppliers[0].supplier_name : '',
    supplier_id: item.suppliers && item.suppliers.length > 0 ? item.suppliers[0].supplier_id : undefined,
    quantity: item.quantity,
    unit: item.unit,
    price: item.price,
    description: item.materials?.material_name || '',
    created_at: item.created_at,
    updated_at: item.updated_at
  }
}

// Create inventory
export const createInventory = async (data: any): Promise<any> => {
  const response = await API.post(ITEMS_URL, data)
  return response.data.data
}

// Update inventory (take item — untuk operasi pengambilan stok)
export const updateInventory = async (id: string, data: any): Promise<any> => {
  const response = await API.put(`${ITEMS_URL}/${id}`, data)
  return response.data.data
}

// Update detail barang (nama, harga, unit) — endpoint khusus edit detail
export const updateInventoryDetails = async (id: string, data: {item_name?: string; price?: number; unit?: string}): Promise<any> => {
  const response = await API.put(`${ITEMS_URL}/${id}/details`, data)
  return response.data.data
}

// Delete inventory
export const deleteInventory = async (id: string): Promise<void> => {
  await API.delete(`${ITEMS_URL}/${id}`)
}

// Get dropdown data
export const getItemsDropdown = async () => {
  const response = await API.get<any>(`${ITEMS_URL}/dropdown-data`)
  // Backend: { success, data: { categories, materials, suppliers } }
  return response.data?.data ?? response.data
}

// Take item (reduce quantity) — sends supplier_ids so backend can create the transaction
export const takeInventoryItem = async (
  id: string,
  quantity: number,
  description: string,
  supplierId?: string
): Promise<void> => {
  await API.put(`${ITEMS_URL}/${id}`, {
    quantity,
    description,
    ...(supplierId ? {supplier_ids: [supplierId]} : {}),
  })
}

// // Take item (reduce quantity)
// export const takeInventoryItem = async (
//   id: number, 
//   quantity: number, 
//   description: string,  // Tambahkan parameter ini
//   adminId: number, 
//   adminName: string
// ): Promise<void> => {
//   return new Promise((resolve, reject) => {
//     setTimeout(() => {
//       const data = getInventoryData()
//       const item = data.find((i: any) => i.id === id)
      
//       if (!item) {
//         reject(new Error('Item not found'))
//         return
//       }
      
//       if (item.quantity < quantity) {
//         reject(new Error('Insufficient stock'))
//         return
//       }
      
//       updateInventoryData(id, {quantity: item.quantity - quantity})
      
//       const {addHistoryRecord} = require('../../../data/dataManager')
//       addHistoryRecord({
//         transaction_id: `TRX${Date.now()}`,
//         item_name: item.name,
//         description: description || item.description, // Use provided description
//         quantity: quantity,
//         unit: item.unit,
//         admin_id: adminId,
//         admin_name: adminName
//       })
      
//       resolve()
//     }, 300)
//   })
// }