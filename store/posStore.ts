import { Cart, CartItem } from "@/app/pos/_types/pos.types";
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

    customerId: undefined,
    customerName: undefined,

    addToCart: (product) => {
        const { cart } = get();
        const existingItem = cart.items.find((item) => item.productId === product.productId);

        let newItems: CartItem[];
        if (existingItem) {
            newItems = cart.items.map((item) =>
                item.productId === product.id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            );
        } else {
            const newItem: CartItem = {
                id: `cart-${Date.now()}`,
                productId: product.id,
                name: product.name,
                price: product.sellingPrice,
                quantity: 1,
                image: product.image,
                category: product.category,
            };
            newItems = [...cart.items, newItem];
        }
        set({ cart: { ...cart, items: newItems } });
        get().calculateTotals();
    },

    removeFromCart: (productId: string) => {
        const { cart } = get();
        const newItems = cart.items.filter((item) => item.productId !== productId);
        set({ cart: { ...cart, items: newItems } });
        get().calculateTotals();
    },

    updateQuantity: (productId, quantity) => {
        const { cart } = get();

        if (quantity <= 0) {
            get().removeFromCart(productId);
            return;
        }

        const newItems = cart.items.map((item) =>
            item.productId === productId ? { ...item, quantity } : item
        );

        set({ cart: { ...cart, items: newItems } });
        get().calculateTotals();
    },

    clearCart: () => {
        set({
            cart: {
                items: [],
                subtotal: 0,
                discount: 0,
                total: 0,
            },
            customerId: undefined,
            customerName: undefined,
        });
    },

    setCustomer: (id: string, name: string) => {
        set({ customerId: id, customerName: name });
    },

    calculateTotals: () => {
        const { cart } = get();
    }
}));