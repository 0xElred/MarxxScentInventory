export interface Product {
    product_id: number;
    name: string;
    price: number | string;
    description?: string | null;
    photo?: string | null;
}

export interface ProductFieldErrors {
    name?: string[];
    price?: string[];
    description?: string[];
    photo?: string[];
}
