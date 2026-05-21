import AxiosInstance from "./AxiosInstance";

const OrderService = {
    loadOrders: async (page = 1, search = "", status = "all") => {
        const params = new URLSearchParams({ page: String(page), status });
        if (search) params.set("search", search);
        return AxiosInstance.get(`/order/loadOrders?${params.toString()}`);
    },
    loadProductsForOrder: async () =>
        AxiosInstance.get("/order/loadProductsForOrder"),
    storeOrder: async (data: object) =>
        AxiosInstance.post("/order/storeOrder", data),
    updateOrder: async (orderId: number, data: object) =>
        AxiosInstance.put(`/order/updateOrder/${orderId}`, data),
    updateOrderStatus: async (orderId: number, status: string) =>
        AxiosInstance.put(`/order/updateOrderStatus/${orderId}`, { status }),
    destroyOrder: async (orderId: number) =>
        AxiosInstance.put(`/order/destroyOrder/${orderId}`),
};

export default OrderService;
