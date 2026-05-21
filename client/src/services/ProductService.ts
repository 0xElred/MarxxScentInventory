import AxiosInstance from "./AxiosInstance";

const ProductService = {
    loadProducts: async (page = 1, search = "") => {
        const q = search ? `&search=${encodeURIComponent(search)}` : "";
        return AxiosInstance.get(`/product/loadProducts?page=${page}${q}`);
    },
    storeProduct: async (data: FormData) =>
        AxiosInstance.post("/product/storeProduct", data),
    updateProduct: async (productId: number, data: FormData) => {
        data.append("_method", "PUT");
        return AxiosInstance.post(`/product/updateProduct/${productId}`, data);
    },
    destroyProduct: async (productId: number) =>
        AxiosInstance.put(`/product/destroyProduct/${productId}`),
};

export default ProductService;
