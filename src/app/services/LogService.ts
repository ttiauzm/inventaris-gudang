import API from "../../api";

export interface Log {
  id?: number;
  message: string;
  created_at?: string;
  // Define log fields
}

export const LogService = {
  getAll: (params?: any) => {
    return API.get('/logs', { params });
  },

  exportExcel: () => {
    return API.get('/export/logs', { responseType: 'blob' });
  }
};
