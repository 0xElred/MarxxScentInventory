import AxiosInstance from "./AxiosInstance";

const UserService = {
    loadUsers: async(page:number, search: string) => {
        try {
            const response = await AxiosInstance.get(search ? `/user/loadUsers?page=${page}&search=${search}` : `/user/loadUsers?page=${page}`);
            return response;
        } catch (error) {
            throw error;
        }
    },
    storeUser: async(data:any) => {
        try {
            const response = await AxiosInstance.post('/user/storeUser', data)
            return response;
        } catch (error) {
            throw error;
        }
    },
    updateUser: async (userId: string | number, data: FormData | Record<string, unknown>) => {
        try {
            // PHP does not populate multipart fields for real HTTP PUT requests, so Laravel
            // sees an empty body and every "required" rule fails. POST + _method=PUT is parsed
            // correctly and still hits Route::put via Laravel's method override.
            if (data instanceof FormData) {
                data.append('_method', 'PUT');
                const response = await AxiosInstance.post(`/user/updateUser/${userId}`, data);
                return response;
            }
            const response = await AxiosInstance.put(`/user/updateUser/${userId}`, data);
            return response;
        } catch (error) {
            throw error;
        }
    },
    destroyUser: async (userId: string | number) => {
        try{
            const response = await AxiosInstance.put(`/user/destroyUser/${userId}`)
            return response;
        } catch(error) {
          throw error;
        }
    }
};
export default UserService;