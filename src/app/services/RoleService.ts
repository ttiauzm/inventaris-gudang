import API from "../../api";

export const RoleService = {
  togglePermission: (roleId: number, permissionId: number) => {
    return API.patch(`/roles/${roleId}/permissions`, { permission_id: permissionId });
  }
};
