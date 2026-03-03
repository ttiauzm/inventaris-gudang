import API from "../../api";

export interface Supplier {
  id?: number;
  name: string;
  // Define supplier fields
  created_at?: string;
  updated_at?: string;
}

export const SupplierService = {
  getAll: (params?: any) => {
    return API.get('/suppliers', { params });
  },

  create: (data: any) => {
    return API.post('/suppliers', data);
  },

  update: (id: number, data: any) => {
    return API.put(`/suppliers/${id}`, data);
  },

  delete: (id: number) => {
    return API.delete(`/suppliers/${id}`);
  }
};
