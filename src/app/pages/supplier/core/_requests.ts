import API from '../../../../api'
import {Supplier} from './_model'

const SUPPLIER_URL = '/suppliers'

const mapSupplier = (item: any): Supplier => ({
  id: item.supplier_id,
  name: item.supplier_name,
  contact_person: item.contact_info,
  phone: item.contact_info,
  address: item.street,
  city: item.city,
  province: item.province,
  postal_code: item.postal_code,
  country: item.country,
  created_at: item.created_at,
  updated_at: item.updated_at,
})

export const getSuppliers = async (): Promise<Supplier[]> => {
  try {
    const response = await API.get<any>(SUPPLIER_URL)
    // Response shape: { success: true, data: [...] }
    const list: any[] = response.data?.data ?? []
    if (!Array.isArray(list)) return []
    return list.map(mapSupplier)
  } catch (error: any) {
    // 403 = user tidak punya izin management_supplier; kembalikan list kosong
    if (error?.response?.status === 403) {
      console.warn('Supplier list: akun ini tidak memiliki izin management_supplier')
      return []
    }
    console.error('Error fetching suppliers:', error)
    return []
  }
}

export const getSupplierById = async (id: string): Promise<Supplier> => {
  const response = await API.get<{data: any}>(`${SUPPLIER_URL}/${id}`)
  const item = response.data.data
  return {
    id: item.supplier_id,
    name: item.supplier_name,
    contact_person: item.contact_info,
    phone: item.contact_info,
    address: item.street,
    city: item.city,
    province: item.province,
    postal_code: item.postal_code,
    country: item.country,
    created_at: item.created_at,
    updated_at: item.updated_at
  }
}

export const createSupplier = async (data: Partial<Supplier>): Promise<Supplier> => {
  const payload = {
    supplier_name: data.name,
    contact_info: data.phone || data.contact_person,
    street: data.address,
    city: data.city,
    province: data.province,
    postal_code: data.postal_code,
    country: data.country
  }
  const response = await API.post<{data: any}>(SUPPLIER_URL, payload)
  return response.data.data
}

export const updateSupplier = async (id: string, data: Partial<Supplier>): Promise<Supplier> => {
  const payload = {
    supplier_name: data.name,
    contact_info: data.phone || data.contact_person,
    street: data.address,
    city: data.city,
    province: data.province,
    postal_code: data.postal_code,
    country: data.country
  }
  const response = await API.put<{data: any}>(`${SUPPLIER_URL}/${id}`, payload)
  return response.data.data
}

export const deleteSupplier = async (id: string): Promise<void> => {
  await API.delete(`${SUPPLIER_URL}/${id}`)
}

export type {Supplier}