import type { Product } from "./ProductInterface";
import type { ProductVariant } from "../utils/productVariants";

export type OrderStatus = "pending" | "shipped" | "delivered" | "canceled";

export interface OrderItem {
    order_item_id: number;
    order_id: number;
    product_id: number;
    variant_type: ProductVariant;
    quantity: number;
    unit_price: number | string;
    product?: Product;
}

export interface Order {
    order_id: number;
    order_code: string;
    receiver_name: string;
    address: string;
    status: OrderStatus;
    total_amount: number | string;
    stock_deducted?: boolean;
    items?: OrderItem[];
}

export interface OrderLineInput {
    product_id: string;
    variant_type: ProductVariant;
    quantity: string;
}

export interface OrderFieldErrors {
    receiver_name?: string[];
    address?: string[];
    status?: string[];
    items?: string[];
    [key: string]: string[] | undefined;
}
