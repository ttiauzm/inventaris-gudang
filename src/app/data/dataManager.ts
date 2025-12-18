// src/app/data/dataManager.ts
import {dummyInventory, dummyHistory, dummyAdmins} from './dummyData'

const STORAGE_KEYS = {
  INVENTORY: 'delova_inventory',
  HISTORY: 'delova_history',
  ADMINS: 'delova_admins',
  SUPPLIERS: 'delova_suppliers',
  CATEGORIES: 'delova_categories',
  MATERIALS: 'delova_materials'
}

// ============== INVENTORY ==============
export const getInventoryData = () => {
  const stored = localStorage.getItem(STORAGE_KEYS.INVENTORY)
  return stored ? JSON.parse(stored) : dummyInventory
}

export const saveInventoryData = (data: any[]) => {
  localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(data))
}

export const addInventoryItem = (item: any) => {
  const data = getInventoryData()
  const newItem = {
    ...item,
    id: Math.max(...data.map((i: any) => i.id), 0) + 1
  }
  data.push(newItem)
  saveInventoryData(data)
  return newItem
}

export const updateInventoryItem = (id: number, updates: any) => {
  const data = getInventoryData()
  const index = data.findIndex((i: any) => i.id === id)
  if (index !== -1) {
    data[index] = {...data[index], ...updates}
    saveInventoryData(data)
    return data[index]
  }
  return null
}

export const deleteInventoryItem = (id: number) => {
  const data = getInventoryData()
  const filtered = data.filter((i: any) => i.id !== id)
  saveInventoryData(filtered)
  return true
}

// ============== HISTORY ==============
export const getHistoryData = () => {
  const stored = localStorage.getItem(STORAGE_KEYS.HISTORY)
  return stored ? JSON.parse(stored) : dummyHistory
}

export const saveHistoryData = (data: any[]) => {
  localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(data))
}

export const addHistoryRecord = (record: any) => {
  const data = getHistoryData()
  const newRecord = {
    ...record,
    id: Math.max(...data.map((i: any) => i.id), 0) + 1,
    date: new Date().toISOString()
  }
  data.unshift(newRecord) // Add to beginning
  saveHistoryData(data)
  return newRecord
}

// ============== ADMINS ==============
export const getAdminsData = () => {
  const stored = localStorage.getItem(STORAGE_KEYS.ADMINS)
  return stored ? JSON.parse(stored) : dummyAdmins
}

export const saveAdminsData = (data: any[]) => {
  localStorage.setItem(STORAGE_KEYS.ADMINS, JSON.stringify(data))
}

export const addAdmin = (admin: any) => {
  const data = getAdminsData()
  const newAdmin = {
    ...admin,
    id: Math.max(...data.map((i: any) => i.id), 0) + 1,
    created_at: new Date().toISOString(),
    last_login: new Date().toISOString()
  }
  data.push(newAdmin)
  saveAdminsData(data)
  return newAdmin
}

export const updateAdmin = (id: number, updates: any) => {
  const data = getAdminsData()
  const index = data.findIndex((i: any) => i.id === id)
  if (index !== -1) {
    data[index] = {...data[index], ...updates}
    saveAdminsData(data)
    return data[index]
  }
  return null
}

export const deleteAdmin = (id: number) => {
  const data = getAdminsData()
  const filtered = data.filter((i: any) => i.id !== id)
  saveAdminsData(filtered)
  return true
}

// ============== SUPPLIERS ==============
const dummySuppliers = [
  {id: 1, name: 'PT. Sinar Jaya Abadi', contact: '081234567890', address: 'Jakarta'},
  {id: 2, name: 'CV. Aselole Hahahehe', contact: '081234567891', address: 'Yogyakarta'},
  {id: 3, name: 'PT. Textile Indonesia', contact: '081234567892', address: 'Bandung'}
]

export const getSuppliersData = () => {
  const stored = localStorage.getItem(STORAGE_KEYS.SUPPLIERS)
  return stored ? JSON.parse(stored) : dummySuppliers
}

export const saveSuppliersData = (data: any[]) => {
  localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(data))
}

export const addSupplier = (supplier: any) => {
  const data = getSuppliersData()
  const newSupplier = {
    ...supplier,
    id: Math.max(...data.map((i: any) => i.id), 0) + 1
  }
  data.push(newSupplier)
  saveSuppliersData(data)
  return newSupplier
}

export const updateSupplier = (id: number, updates: any) => {
  const data = getSuppliersData()
  const index = data.findIndex((i: any) => i.id === id)
  if (index !== -1) {
    data[index] = {...data[index], ...updates}
    saveSuppliersData(data)
    return data[index]
  }
  return null
}

export const deleteSupplier = (id: number) => {
  const data = getSuppliersData()
  const filtered = data.filter((i: any) => i.id !== id)
  saveSuppliersData(filtered)
  return true
}

// ============== CATEGORIES ==============
const dummyCategories = [
  {id: 1, name: 'Kain', description: 'Berbagai jenis kain'},
  {id: 2, name: 'Benang', description: 'Benang jahit'},
  {id: 3, name: 'Aksesoris', description: 'Aksesoris pakaian'}
]

export const getCategoriesData = () => {
  const stored = localStorage.getItem(STORAGE_KEYS.CATEGORIES)
  return stored ? JSON.parse(stored) : dummyCategories
}

export const saveCategoriesData = (data: any[]) => {
  localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(data))
}

export const addCategory = (category: any) => {
  const data = getCategoriesData()
  const newCategory = {
    ...category,
    id: Math.max(...data.map((i: any) => i.id), 0) + 1
  }
  data.push(newCategory)
  saveCategoriesData(data)
  return newCategory
}

export const updateCategory = (id: number, updates: any) => {
  const data = getCategoriesData()
  const index = data.findIndex((i: any) => i.id === id)
  if (index !== -1) {
    data[index] = {...data[index], ...updates}
    saveCategoriesData(data)
    return data[index]
  }
  return null
}

export const deleteCategory = (id: number) => {
  const data = getCategoriesData()
  const filtered = data.filter((i: any) => i.id !== id)
  saveCategoriesData(filtered)
  return true
}

// ============== MATERIALS ==============
const dummyMaterials = [
  {id: 1, name: 'Sutra', description: 'Sutra premium'},
  {id: 2, name: 'Katun', description: 'Katun lokal'},
  {id: 3, name: 'Polyester', description: 'Polyester synthetic'}
]

export const getMaterialsData = () => {
  const stored = localStorage.getItem(STORAGE_KEYS.MATERIALS)
  return stored ? JSON.parse(stored) : dummyMaterials
}

export const saveMaterialsData = (data: any[]) => {
  localStorage.setItem(STORAGE_KEYS.MATERIALS, JSON.stringify(data))
}

export const addMaterial = (material: any) => {
  const data = getMaterialsData()
  const newMaterial = {
    ...material,
    id: Math.max(...data.map((i: any) => i.id), 0) + 1
  }
  data.push(newMaterial)
  saveMaterialsData(data)
  return newMaterial
}

export const updateMaterial = (id: number, updates: any) => {
  const data = getMaterialsData()
  const index = data.findIndex((i: any) => i.id === id)
  if (index !== -1) {
    data[index] = {...data[index], ...updates}
    saveMaterialsData(data)
    return data[index]
  }
  return null
}

export const deleteMaterial = (id: number) => {
  const data = getMaterialsData()
  const filtered = data.filter((i: any) => i.id !== id)
  saveMaterialsData(filtered)
  return true
}

// ============== RESET DATA ==============
export const resetAllData = () => {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key)
  })
}