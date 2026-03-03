import API from '../../../../api'

const MATERIAL_URL = '/materials'

export interface Material {
  id: string
  name: string
  description: string
}

export const getMaterials = async (): Promise<Material[]> => {
  const response = await API.get<{data: any[]}>(MATERIAL_URL)
  return response.data.data.map((item: any) => ({
    id: item.material_id,
    name: item.material_name,
    description: item.description || ''
  }))
}

export const getMaterialById = async (id: string): Promise<Material> => {
  const response = await API.get<{data: any}>(`${MATERIAL_URL}/${id}`)
  const item = response.data.data
  return {
    id: item.material_id,
    name: item.material_name,
    description: item.description || ''
  }
}

export const createMaterial = async (data: Partial<Material>): Promise<Material> => {
  const payload = {
    material_name: data.name,
    description: data.description
  }
  const response = await API.post<{data: any}>(MATERIAL_URL, payload)
  return response.data.data
}

export const updateMaterial = async (id: string, data: Partial<Material>): Promise<Material> => {
  const payload = {
    material_name: data.name,
    description: data.description
  }
  const response = await API.put<{data: any}>(`${MATERIAL_URL}/${id}`, payload)
  return response.data.data
}

export const deleteMaterial = async (id: string): Promise<void> => {
  await API.delete(`${MATERIAL_URL}/${id}`)
}

export const getMaterialsDropdown = async () => {
  const response = await API.get(`${MATERIAL_URL}/dropdown-data`)
  return response.data.data
}
