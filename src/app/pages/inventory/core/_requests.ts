import API from '../../../../api'
import { InventoryItem, InventoryResponse } from './_model'

const ITEMS_URL = '/items'

// Get all inventory
export const getInventory = async (params?: {
  page?: number
  per_page?: number
  search?: string
  category?: string
  category_id?: string
}): Promise<InventoryItem[]> => {
  console.log('🌐 API Request to /items with params:', params)
  const response = await API.get<InventoryResponse>(ITEMS_URL, { params })
  
  console.log('📦 Raw response.data:', response.data)
  console.log('📦 response.data.data type:', typeof (response.data as any).data, Array.isArray((response.data as any).data))
  
  // Handle both paginated and non-paginated responses
  const items = (response.data as any).data?.data || (response.data as any).data || response.data
  
  console.log('📦 Extracted items:', items)
  console.log('📦 Items count:', items?.length)
  
  if (items && items.length > 0) {
    console.log('📦 First item raw:', items[0])
    console.log('📦 First item category_id:', items[0].category_id, items[0].categories?.category_id)
  }
  
  return items.map((item: any) => ({
    id: item.item_id,
    name: item.item_name,
    category: item.categories?.category_name || '',
    category_id: item.categories?.category_id || item.category_id || '',
    material: item.materials?.material_name || '',
    supplier: item.suppliers && item.suppliers.length > 0 ? item.suppliers[0].supplier_name : '',
    supplier_id: item.suppliers && item.suppliers.length > 0 ? item.suppliers[0].supplier_id : undefined,
    quantity: item.quantity,
    unit: item.unit,
    price: item.price,
    description: item.materials?.material_name || '',
    // image: item.images && item.images.length > 0 ? `/storage/${item.images[0].file_path}` : undefined,
    image: item.image_url || undefined,
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
    image: item.images && item.images.length > 0 ? `/storage/${item.images[0].file_path}` : undefined,
    created_at: item.created_at,
    updated_at: item.updated_at
  }
}

// Create inventory
export const createInventory = async (data: any, imageFile?: File | null): Promise<any> => {
  const form = new FormData()
  Object.entries(data).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      ;(value as string[]).forEach(v => form.append(`${key}[]`, v))
    } else {
      form.append(key, String(value ?? ''))
    }
  })
  if (imageFile) {
    form.append('images', imageFile)
  }
  const response = await API.post(ITEMS_URL, form, {
    headers: {'Content-Type': 'multipart/form-data'},
  })
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