import type { Product } from "./ProductInterface";

export type OrderStatus = "pending" | "shipped" | "delivered" | "canceled";

export interface Order {
    order_id: number;
    order_code: string;
    product_id: number;
    receiver_name: string;
    address: string;
    status: OrderStatus;
    total_amount: number | string;
    product?: Product;
}

export interface OrderFieldErrors {
    product_id?: string[];
    receiver_name?: string[];
    address?: string[];
    status?: string[];
}
