import API from '../../../../api'

const CATEGORY_URL = '/categories'

export interface Category {
  id: string
  name: string
  description: string
  unit: string
}

export const getCategories = async (): Promise<Category[]> => {
  const response = await API.get<{data: any[]}>(CATEGORY_URL)
  return response.data.data.map((item: any) => ({
    id: item.category_id,
    name: item.category_name,
    description: item.description || '',
    unit: item.unit || ''
  }))
}

export const getCategoryById = async (id: string): Promise<Category> => {
  const response = await API.get<{data: any}>(`${CATEGORY_URL}/${id}`)
  const item = response.data.data
  return {
    id: item.category_id,
    name: item.category_name,
    description: item.description || '',
    unit: item.unit || ''
  }
}

export const createCategory = async (data: Partial<Category>): Promise<Category> => {
  const payload = {
    category_name: data.name,
    description: data.description,
    unit: data.unit
  }
  const response = await API.post<{data: any}>(CATEGORY_URL, payload)
  return response.data.data
}

export const updateCategory = async (id: string, data: Partial<Category>): Promise<Category> => {
  const payload = {
    category_name: data.name,
    description: data.description,
    unit: data.unit
  }
  const response = await API.put<{data: any}>(`${CATEGORY_URL}/${id}`, payload)
  return response.data.data
}

export const deleteCategory = async (id: string): Promise<void> => {
  await API.delete(`${CATEGORY_URL}/${id}`)
}

export const getCategoriesDropdown = async () => {
  const response = await API.get(`${CATEGORY_URL}/dropdown-data`)
  return response.data.data
}