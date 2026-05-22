export interface Product {
    product_id: number;
    name: string;
    price: number | string;
    bottles: number;
    stock_5ml: number;
    stock_10ml: number;
    description?: string | null;
    photo?: string | null;
}

export interface ProductFieldErrors {
    name?: string[];
    price?: string[];
    bottles?: string[];
    stock_5ml?: string[];
    stock_10ml?: string[];
    description?: string[];
    photo?: string[];
}
