import AxiosInstance from "./AxiosInstance";

const RoleService = {
    loadRoles: async () => AxiosInstance.get("/role/loadRoles"),
    getRole: async (roleId: number) => AxiosInstance.get(`/role/getRole/${roleId}`),
    storeRole: async (data: { name: string }) =>
        AxiosInstance.post("/role/storeRole", data),
    updateRole: async (roleId: number, data: { name: string }) =>
        AxiosInstance.put(`/role/updateRole/${roleId}`, data),
    destroyRole: async (roleId: number) =>
        AxiosInstance.put(`/role/destroyRole/${roleId}`),
};

export default RoleService;
