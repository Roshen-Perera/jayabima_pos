export interface CartItem {
    id: string;
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
    category?: string;
}

export interface Cart {
    items: CartItem[];
    subtotal: number;
    tax: number;
    discount: number;
    total: number;
}