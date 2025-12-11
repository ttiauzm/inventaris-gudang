import API from '../../../../api'
import {Supplier} from './_model'

const SUPPLIER_URL = '/suppliers'

export const getSuppliers = async (): Promise<Supplier[]> => {
  const response = await API.get<{data: Supplier[]}>(SUPPLIER_URL)
  return response.data.data
}

export const getSupplierById = async (id: number): Promise<Supplier> => {
  const response = await API.get<{data: Supplier}>(`${SUPPLIER_URL}/${id}`)
  return response.data.data
}

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