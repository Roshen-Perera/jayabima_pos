import { Product } from "@/app/inventory/_types/product.types";
import { Cart, CartItem } from "@/app/pos/_types/pos.types";
import { create } from "zustand";

interface POSState {
    cart: Cart;
    customerId?: string;
    customerName?: string;

    addToCart: (product: Product) => void;
    removeFromCart: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    applyDiscount: (discount: number) => void;
    updateItemPrice: (productId: string, price: number | undefined) => void;
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
        const existingItem = cart.items.find((item) => item.productId === product.id);

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
                price: product.price,
                quantity: 1,
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

    updateItemPrice: (productId, price) =>
        set((state) => ({
            cart: {
                ...state.cart,
                items: state.cart.items.map((item) =>
                    item.productId === productId
                        ? { ...item, overridePrice: price }
                        : item
                ),
            },
        })),

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

    applyDiscount: (discount: number) => {
        const { cart } = get();
        set({ cart: { ...cart, discount } });
        get().calculateTotals();
    },

    setCustomer: (id, name) => {
        set({ customerId: id, customerName: name });
    },

    calculateTotals: () => {
        const { cart } = get();

        const subtotal = cart.items.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
        );

        const total = subtotal - cart.discount;
        set({ cart: { ...cart, subtotal, total } });
    }
}));