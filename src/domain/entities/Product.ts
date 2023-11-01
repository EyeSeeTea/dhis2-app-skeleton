export interface Product {
    id: string;
    title: string;
    image: string;
    quantity: number;
    status: number;
}

export type ProductStatus = "active" | "inactive";
