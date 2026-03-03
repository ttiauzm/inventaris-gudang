import API from "../../api";

export interface Permission {
  id?: number;
  name: string;
}

export const PermissionService = {
  getAll: (params?: any) => {
    return API.get('/permissions', { params });
  }
};
