export interface DashboardStats {
    total_products: number;
    pending_orders: number;
    sales_this_month: number;
    sales_last_month: number;
    sales_percent_change: number;
}

export interface ActivityLog {
    activity_log_id: number;
    user_name: string;
    activity: string;
    time_ago?: string;
    created_at: string;
}
