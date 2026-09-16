
export interface StockBatch {
    id: string;
    productId: string;
    purchaseOrderId?: string | null;
    batchNumber?: string | null;
    cost: number;
    quantity: number;
    remainingQty: number;
    createdAt: string | Date;
    updatedAt?: string | Date;
    purchaseOrder?: {
        id: string;
        orderNumber: string;
        receivedAt?: string | Date | null;
        supplier?: { id: string; name: string };
    } | null;
}

export interface Product {
    id: string;
    name: string;
    category: string;
    sku: string;
    barcode?: string;
    supplierId?: string;
    price: number;
    previousPrice?: number;
    cost: number;
    stock: number;
    minStock: number;
    description?: string;
    active: boolean;
    image?: string;
    createdAt: Date;
    updatedAt: Date;
    batches?: StockBatch[];
}

export type ProductFormData = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>;