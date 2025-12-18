// import API from '../../../../api'
// import {InventoryItem, InventoryResponse} from './_model'

// const INVENTORY_URL = '/inventory'

// // Get all inventory
// export const getInventory = async (params?: {
//   page?: number
//   per_page?: number
//   search?: string
//   category?: string
// }): Promise<InventoryItem[]> => {
//   const response = await API.get<InventoryResponse>(INVENTORY_URL, {params})
//   return response.data.data
// }

// // Get single inventory item
// export const getInventoryById = async (id: number): Promise<InventoryItem> => {
//   const response = await API.get<{data: InventoryItem}>(`${INVENTORY_URL}/${id}`)
//   return response.data.data
// }

// // Create inventory
// export const createInventory = async (data: Partial<InventoryItem>): Promise<InventoryItem> => {
//   const response = await API.post<{data: InventoryItem}>(INVENTORY_URL, data)
//   return response.data.data
// }

// // Update inventory
// export const updateInventory = async (id: number, data: Partial<InventoryItem>): Promise<InventoryItem> => {
//   const response = await API.put<{data: InventoryItem}>(`${INVENTORY_URL}/${id}`, data)
//   return response.data.data
// }

// // Delete inventory
// export const deleteInventory = async (id: number): Promise<void> => {
//   await API.delete(`${INVENTORY_URL}/${id}`)
// }

// // Upload inventory image
// export const uploadInventoryImage = async (id: number, file: File): Promise<string> => {
//   const formData = new FormData()
//   formData.append('image', file)

//   const response = await API.post<{data: {url: string}}>(`${INVENTORY_URL}/${id}/image`, formData, {
//     headers: {'Content-Type': 'multipart/form-data'}
//   })

//   return response.data.data.url
// }

// // Take item (reduce quantity)
// export const takeInventoryItem = async (
//   id: number,
//   quantity: number,
//   description: string,
//   adminId: number,
//   adminName: string
// ): Promise<void> => {
//   const response = await API.post(`${INVENTORY_URL}/${id}/take`, {
//     quantity,
//     description,
//     admin_id: adminId,
//     admin_name: adminName
//   })
//   return response.data
// }


import { InventoryItem } from './_model'
import {
  getInventoryData,
  addInventoryItem,
  updateInventoryItem as updateInventoryData,
  deleteInventoryItem as deleteInventoryData
} from '../../../data/dataManager'

// Get all inventory
export const getInventory = async (): Promise<InventoryItem[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(getInventoryData())
    }, 300) // Simulate API delay
  })
}

// Get single inventory item
export const getInventoryById = async (id: number): Promise<InventoryItem> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const data = getInventoryData()
      const item = data.find((i: any) => i.id === id)
      if (item) {
        resolve(item)
      } else {
        reject(new Error('Item not found'))
      }
    }, 300)
  })
}

// Create inventory
export const createInventory = async (data: Partial<InventoryItem>): Promise<InventoryItem> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newItem = addInventoryItem(data)
      resolve(newItem)
    }, 300)
  })
}

// Update inventory
export const updateInventory = async (id: number, data: Partial<InventoryItem>): Promise<InventoryItem> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const updated = updateInventoryData(id, data)
      if (updated) {
        resolve(updated)
      } else {
        reject(new Error('Update failed'))
      }
    }, 300)
  })
}

// Delete inventory
export const deleteInventory = async (id: number): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      deleteInventoryData(id)
      resolve()
    }, 300)
  })
}

// Take item (reduce quantity)
export const takeInventoryItem = async (
  id: number, 
  quantity: number, 
  description: string,  // Tambahkan parameter ini
  adminId: number, 
  adminName: string
): Promise<void> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const data = getInventoryData()
      const item = data.find((i: any) => i.id === id)
      
      if (!item) {
        reject(new Error('Item not found'))
        return
      }
      
      if (item.quantity < quantity) {
        reject(new Error('Insufficient stock'))
        return
      }
      
      updateInventoryData(id, {quantity: item.quantity - quantity})
      
      const {addHistoryRecord} = require('../../../data/dataManager')
      addHistoryRecord({
        transaction_id: `TRX${Date.now()}`,
        item_name: item.name,
        description: description || item.description, // Use provided description
        quantity: quantity,
        unit: item.unit,
        admin_id: adminId,
        admin_name: adminName
      })
      
      resolve()
    }, 300)
  })
}