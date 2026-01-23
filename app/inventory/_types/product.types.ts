export interface Product {
    id: string;
    name: string;
    category: string;
    sku: string;
    price: number;
    cost: number;
    stock: number;
    minStock: number;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export type ProductFormData = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>;