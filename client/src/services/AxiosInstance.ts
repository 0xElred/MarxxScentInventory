import axios from "axios";

const baseURL =
    import.meta.env.VITE_API_URL ??
    (import.meta.env.DEV ? "/api" : "http://localhost/CloresVigoBilliones/server/public/api");

const AxiosInstance = axios.create({ baseURL });

AxiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
    }
    if (config.data instanceof FormData) {
        const h = config.headers;
        if (h && typeof (h as { delete?: (name: string) => void }).delete === "function") {
            (h as { delete: (name: string) => void }).delete("Content-Type");
            (h as { delete: (name: string) => void }).delete("content-type");
        }
        delete (config.headers as Record<string, unknown>)["Content-Type"];
        delete (config.headers as Record<string, unknown>)["content-type"];
    } else {
        config.headers["Content-Type"] = "application/json";
    }
    return config;
});

AxiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        if (status === 401) {
            localStorage.removeItem("token");
            if (window.location.pathname !== "/") {
                window.location.assign("/");
            }
        } else if (status !== undefined && status !== 422) {
            console.error("Unexpected response error: ", error);
        }
        return Promise.reject(error);
    }
);

export default AxiosInstance;
