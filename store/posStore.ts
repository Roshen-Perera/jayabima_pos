import { Cart } from "@/app/pos/_types/pos.types";
import { create } from "domain";

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

export const usePOSStore = create<POSState>((set, get) => ({
    //Initial state
    cart: {
        items: [],
        subtotal: 0,
        discount: 0,
        total: 0,
    },
}));