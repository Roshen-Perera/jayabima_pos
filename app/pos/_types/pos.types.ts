export interface CartItem {
    id: string;
    productId: string;
    name: string;
    price: number;
    discount: number;
    overridePrice?: number; 
    quantity: number;
    image?: string;
    category?: string;
}

export interface Cart {
    items: CartItem[];
    subtotal: number;
    discount: number;
    total: number;
}

export type PaymentMethod = 'CASH' | 'CARD' | 'MOBILE' | 'OTHER';
export type SaleStatus = 'COMPLETED' | 'PENDING' | 'CANCELLED' | 'REFUNDED';

export interface Sale {
    id: string;
    items: CartItem[];
    customerId?: string;
    customerName?: string;
    userId: string;
    userName: string;
    subtotal: number;
    discount: number;
    total: number;
    paymentMethod: PaymentMethod;
    status: SaleStatus;
    createdAt: Date;
}

export interface SaleItem {
    id: string;
    saleId: string;
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    subtotal: number;
}