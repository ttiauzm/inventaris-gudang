import API from "../../api";

export interface Transaction {
  id?: number;
  // Define transaction fields
  created_at?: string;
  updated_at?: string;
}

export const TransactionService = {
  getAll: (params?: any) => {
    return API.get('/transactions', { params });
  },

  getById: (id: number) => {
    return API.get(`/transactions/${id}`);
  },

  exportExcel: () => {
    return API.get('/export/transactions', { responseType: 'blob' });
  }
};
