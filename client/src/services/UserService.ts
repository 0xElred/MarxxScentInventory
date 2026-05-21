import AxiosInstance from "./AxiosInstance";

const UserService = {
    loadUsers: async (page = 1, search = "") => {
        const q = search ? `&search=${encodeURIComponent(search)}` : "";
        return AxiosInstance.get(`/user/loadUsers?page=${page}${q}`);
    },
    storeUser: async (data: FormData) =>
        AxiosInstance.post("/user/storeUser", data),
    updateUser: async (userId: number, data: FormData) => {
        data.append("_method", "PUT");
        return AxiosInstance.post(`/user/updateUser/${userId}`, data);
    },
    destroyUser: async (userId: number) =>
        AxiosInstance.put(`/user/destroyUser/${userId}`),
};

export default UserService;
