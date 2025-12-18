import API from '../../../../api'
import {Supplier} from './_model'

const SUPPLIER_URL = '/suppliers'

export const getSuppliers = async (): Promise<Supplier[]> => {
  try {
    const response = await API.get<{data: Supplier[]}>(SUPPLIER_URL)
    return response.data.data
  } catch (error) {
    console.error('Error fetching suppliers:', error)
    return getDummySuppliers()
  }
}

export const getSupplierById = async (id: number): Promise<Supplier> => {
  try {
    const response = await API.get<{data: Supplier}>(`${SUPPLIER_URL}/${id}`)
    return response.data.data
  } catch (error) {
    console.error('Error fetching supplier:', error)
    const dummy = getDummySuppliers().find(s => s.id === id)
    if (dummy) return dummy
    throw error
  }
}

// Dummy data for development
const getDummySuppliers = (): Supplier[] => [
  {
    id: 1,
    name: 'PT. Tekstil Sejahtera',
    contact_person: 'Budi Santoso',
    phone: '08123456789',
    address: 'Jl. Industri No. 12, Bandung',
    email: 'budi@tekstil.com'
  },
  {
    id: 2,
    name: 'CV. Benang Emas',
    contact_person: 'Siti Aminah',
    phone: '08776543210',
    address: 'Kawasan Industri Jababeka, Cikarang',
    email: 'siti@benangemas.com'
  },
  {
    id: 3,
    name: 'Toko Kain Jaya',
    contact_person: 'Hendra Wijaya',
    phone: '08551234567',
    address: 'Pasar Tanah Abang Blok A, Jakarta',
    email: 'hendra@kainjaya.com'
  }
]

export const createSupplier = async (data: Partial<Supplier>): Promise<Supplier> => {
  const response = await API.post<{data: Supplier}>(SUPPLIER_URL, data)
  return response.data.data
}

export const updateSupplier = async (id: number, data: Partial<Supplier>): Promise<Supplier> => {
  const response = await API.put<{data: Supplier}>(`${SUPPLIER_URL}/${id}`, data)
  return response.data.data
}

export const deleteSupplier = async (id: number): Promise<void> => {
  await API.delete(`${SUPPLIER_URL}/${id}`)
}

export type {Supplier}