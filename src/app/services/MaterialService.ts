import API from "../../api";

export interface Material {
  id?: number;
  name: string;
  // Define material fields
  created_at?: string;
  updated_at?: string;
}

export const MaterialService = {
  getDropdownData: () => {
    return API.get('/materials/dropdown-data');
  },

  getAll: (params?: any) => {
    return API.get('/materials', { params });
  },

  getById: (id: number) => {
    return API.get(`/materials/${id}`);
  },

  create: (data: any) => {
    return API.post('/materials', data);
  },

  update: (id: number, data: any) => {
    return API.put(`/materials/${id}`, data);
  },

  delete: (id: number) => {
    return API.delete(`/materials/${id}`);
  }
};
