export type PurchaseOrderStatus = 'DRAFT' | 'ORDERED' | 'RECEIVED' | 'CANCELLED';

export interface PurchaseOrderItem {
    id: string;
    purchaseOrderId: string;
    productId: string;
    productName?: string;
    product?: {
        id: string;
        name: string;
        sku: string;
        cost: number;
        price: number;
        stock: number;
    };
    quantity: number;
    cost: number;
    total: number;
    createdAt: Date;
}

export interface PurchaseOrder {
    id: string;
    orderNumber: string;
    supplierId: string;
    supplierName?: string;
    userId: string;
    userName?: string;
    totalAmount: number;
    status: PurchaseOrderStatus;
    note?: string | null;
    expectedDate?: Date | null;
    receivedAt?: Date | null;
    items: PurchaseOrderItem[];
    createdAt: Date;
    updatedAt: Date;
}

export interface CreatePurchaseOrderInput {
    supplierId: string;
    note?: string;
    expectedDate?: string;
    items: {
        productId: string;
        quantity: number;
        cost: number;
    }[];
}
