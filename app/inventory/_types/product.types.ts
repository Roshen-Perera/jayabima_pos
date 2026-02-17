
export interface Product {
    id: string;
    name: string;
    category: string;
    sku: string;
    supplierId?: string;
    price: number;
    cost: number;
    stock: number;
    minStock: number;
    description?: string;
    active: boolean;
    image?: string;
    createdAt: Date;
    updatedAt: Date;
}

export type ProductFormData = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>;