import type { Order, OrderItem } from "../interfaces/OrderInterface";
import { getVariantUnitPrice } from "./productVariants";

export function getOrderLineTotal(item: OrderItem): number {
    if (item.product && item.variant_type) {
        return getVariantUnitPrice(item.product.price, item.variant_type) * item.quantity;
    }

    return Number(item.unit_price) * item.quantity;
}

export function getOrderTotal(order: Order): number {
    if (order.items?.length) {
        return order.items.reduce((sum, item) => sum + getOrderLineTotal(item), 0);
    }

    return Number(order.total_amount);
}
