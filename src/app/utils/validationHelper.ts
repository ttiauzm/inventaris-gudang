// src/app/utils/validationHelper.ts

/**
 * Validation Helper untuk UAT Test Cases
 */

// Validasi field kosong
export const validateRequired = (value: any, fieldName: string): string | null => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return `${fieldName} wajib diisi`
  }
  return null
}

// Validasi angka
export const validateNumber = (value: any, fieldName: string): string | null => {
  if (isNaN(Number(value))) {
    return `${fieldName} harus berupa angka`
  }
  return null
}

// Validasi email
export const validateEmail = (email: string): string | null => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return 'Format email tidak valid'
  }
  return null
}

// Validasi username unik (untuk UAT)
export const validateUniqueUsername = (username: string, existingUsers: any[]): string | null => {
  const exists = existingUsers.some(user => user.username === username || user.email === username)
  if (exists) {
    return 'Username sudah digunakan'
  }
  return null
}

// Validasi form inventory
export interface InventoryFormData {
  name: string
  supplier: string
  category: string
  material: string
  quantity: number | string
  unit: string
  description?: string
}

export const validateInventoryForm = (data: InventoryFormData): Record<string, string> => {
  const errors: Record<string, string> = {}

  // Validasi field wajib
  if (!data.name?.trim()) {
    errors.name = 'Nama barang wajib diisi'
  }
  if (!data.supplier?.trim()) {
    errors.supplier = 'Supplier wajib diisi'
  }
  if (!data.category?.trim()) {
    errors.category = 'Kategori wajib diisi'
  }
  if (!data.material?.trim()) {
    errors.material = 'Material wajib diisi'
  }
  if (!data.unit?.trim()) {
    errors.unit = 'Unit wajib diisi'
  }

  // Validasi quantity
  if (!data.quantity && data.quantity !== 0) {
    errors.quantity = 'Jumlah wajib diisi'
  } else if (isNaN(Number(data.quantity))) {
    errors.quantity = 'Stok harus berupa angka'
  }

  return errors
}

// Validasi form take item
export interface TakeItemFormData {
  quantity: number | string
  description: string
}

export const validateTakeItemForm = (data: TakeItemFormData, maxQuantity: number): Record<string, string> => {
  const errors: Record<string, string> = {}

  // Validasi quantity
  if (!data.quantity && data.quantity !== 0) {
    errors.quantity = 'Stok wajib diisi'
  } else if (isNaN(Number(data.quantity))) {
    errors.quantity = 'Stok harus berupa angka'
  } else if (Number(data.quantity) <= 0) {
    errors.quantity = 'Stok harus lebih dari 0'
  } else if (Number(data.quantity) > maxQuantity) {
    errors.quantity = `Stok tidak boleh lebih dari ${maxQuantity}`
  }

  // Validasi deskripsi
  if (!data.description?.trim()) {
    errors.description = 'Deskripsi pengambilan wajib diisi'
  }

  // Jika ada error quantity atau description
  if (errors.quantity || errors.description) {
    errors.general = 'Stok dan Deskripsi Wajib diisi'
  }

  return errors
}

// Validasi form user
export interface UserFormData {
  name: string
  email: string
  password?: string
  role: string
}

export const validateUserForm = (data: UserFormData, isEdit: boolean = false): Record<string, string> => {
  const errors: Record<string, string> = {}

  if (!data.name?.trim()) {
    errors.name = 'Nama wajib diisi'
  }
  if (!data.email?.trim()) {
    errors.email = 'Email wajib diisi'
  } else if (validateEmail(data.email)) {
    errors.email = 'Format email tidak valid'
  }
  
  // Password hanya required saat create
  if (!isEdit && !data.password?.trim()) {
    errors.password = 'Password wajib diisi'
  }

  if (!errors.name && !errors.email && (!isEdit ? !errors.password : true)) {
    return errors
  }

  // Jika ada field yang kosong
  if (Object.keys(errors).length > 0) {
    errors.general = 'Semua kolom wajib diisi'
  }

  return errors
}

// Validasi form supplier
export interface SupplierFormData {
  name: string
  contact_person?: string
  phone?: string
  address?: string
}

export const validateSupplierForm = (data: SupplierFormData): Record<string, string> => {
  const errors: Record<string, string> = {}

  if (!data.name?.trim()) {
    errors.name = 'Nama supplier wajib diisi'
    errors.general = 'Semua kolom wajib diisi'
  }

  return errors
}

// Validasi form category/material
export interface CategoryMaterialFormData {
  name: string
  description?: string
}

export const validateCategoryMaterialForm = (data: CategoryMaterialFormData): Record<string, string> => {
  const errors: Record<string, string> = {}

  if (!data.name?.trim()) {
    errors.name = 'Nama wajib diisi'
    errors.general = 'Semua kolom wajib diisi'
  }

  return errors
}

// Konfirmasi delete dengan custom message
export const confirmDelete = (itemName: string, type: string = 'item'): boolean => {
  return window.confirm(`Apakah Anda yakin ingin menghapus ${type} "${itemName}"?`)
}

// Show validation errors as alert or toast
export const showValidationErrors = (errors: Record<string, string>): void => {
  if (errors.general) {
    alert(errors.general)
  } else {
    const errorMessages = Object.values(errors).join('\n')
    alert(errorMessages)
  }
}