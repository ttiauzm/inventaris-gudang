import API from "../../api";

export interface Category {
  id?: number;
  name: string;
  // Define category fields
  created_at?: string;
  updated_at?: string;
}

export const CategoryService = {
  getDropdownData: () => {
    return API.get('/categories/dropdown-data');
  },

  getAll: (params?: any) => {
    return API.get('/categories', { params });
  },

  getById: (id: number) => {
    return API.get(`/categories/${id}`);
  },

  create: (data: any) => {
    return API.post('/categories', data);
  },

  update: (id: number, data: any) => {
    return API.put(`/categories/${id}`, data);
  },

  delete: (id: number) => {
    return API.delete(`/categories/${id}`);
  }
};
