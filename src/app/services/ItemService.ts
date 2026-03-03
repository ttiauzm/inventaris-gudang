import API from "../../api";

export interface Item {
  id?: number;
  name: string;
  description?: string;
  // Add other fields as necessary based on your database structure
  created_at?: string;
  updated_at?: string;
}

export const ItemService = {
  getDropdownData: () => {
    return API.get('/items/dropdown-data');
  },
  
  getAll: (params?: any) => {
    return API.get('/items', { params });
  },

  getById: (id: number) => {
    return API.get(`/items/${id}`);
  },

  create: (data: any) => {
    return API.post('/items', data);
  },

  update: (id: number, data: any) => {
    return API.put(`/items/${id}`, data);
  },

  delete: (id: number) => {
    return API.delete(`/items/${id}`);
  }
};
