import { Cart } from "@/app/pos/_types/pos.types";

interface POSState {
    cart: Cart;
    customerId?: string;
    customerName?: string;

    addToCart: (product: Cart) => void;
    removeFromCart: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    setCustomer: (id?: string, name?: string) => void;
    calculateTotals: () => void;
}