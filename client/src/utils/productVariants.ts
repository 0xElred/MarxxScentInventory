import type { Product } from "../interfaces/ProductInterface";

export type ProductVariant = "bottle" | "5ml" | "10ml";

export const PRODUCT_VARIANTS: ProductVariant[] = ["bottle", "5ml", "10ml"];

export const VARIANT_LABELS: Record<ProductVariant, string> = {
    bottle: "Bottle",
    "5ml": "5ML",
    "10ml": "10ML",
};

export function getVariantUnitPrice(bottlePrice: number | string, variant: ProductVariant): number {
    const price = Number(bottlePrice);
    switch (variant) {
        case "bottle":
            return price;
        case "5ml":
            return price / 20;
        case "10ml":
            return price / 10;
    }
}

export function getVariantStock(product: Product, variant: ProductVariant): number {
    switch (variant) {
        case "bottle":
            return product.bottles;
        case "5ml":
            return product.stock_5ml;
        case "10ml":
            return product.stock_10ml;
    }
}

export function formatVariantStockSummary(product: Product): string {
    return `Bottles: ${product.bottles} · 5ML: ${product.stock_5ml} · 10ML: ${product.stock_10ml}`;
}
