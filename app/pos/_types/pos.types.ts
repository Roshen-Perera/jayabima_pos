export interface CartItem {
    id: string;
    productId: string;
    name: string;
    price: number;
    discount?: number;
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
    originalTotal: number;     // sum of all items at full inventory price
    itemDiscount: number;      // total saved via per-item overrides
    totalSavings: number;      // itemDiscount + cart discount
    subtotal: number;          // selling price after item discounts
    discount: number;          // cart-level flat discount
    total: number;
    paymentMethod: PaymentMethod;
    cashPaid?: number;       // amount of cash handed by customer (CASH only)
    cashBalance?: number;    // change returned to customer (CASH only)
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