import AxiosInstance from "./AxiosInstance";

const DashboardService = {
    stats: async () => AxiosInstance.get("/dashboard/stats"),
    activityLogs: async (page = 1) =>
        AxiosInstance.get(`/dashboard/activity-logs?page=${page}&per_page=5`),
};

export default DashboardService;
