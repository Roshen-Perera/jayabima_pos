import { Product } from "@/app/inventory/_types/product.types";
import { Cart, CartItem, HeldTransaction, Sale } from "@/app/pos/_types/pos.types";
import { create } from "zustand";

interface POSState {
    cart: Cart;
    customerId?: string;
    customerName?: string;
    sales: Sale[];
    heldTransactions: HeldTransaction[];

    addToCart: (product: Product) => void;
    removeFromCart: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    applyDiscount: (discount: number) => void;
    updateItemPrice: (productId: string, price: number | undefined) => void;
    setCustomer: (id?: string, name?: string) => void;
    calculateTotals: () => void;

    // Hold feature actions
    loadHeldTransactions: () => void;
    holdCart: (note?: string) => string | null;
    resumeHeldTransaction: (id: string) => boolean;
    deleteHeldTransaction: (id: string) => void;
}

export const usePOSStore = create<POSState>((set, get) => ({
    //Initial state
    cart: {
        items: [],
        discount: 0,
        subtotal: 0,
        total: 0,
    },

    customerId: undefined,
    customerName: undefined,
    sales: [],
    heldTransactions: [],

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
                price: Number(product.price),
                previousPrice: product.previousPrice ? Number(product.previousPrice) : undefined,
                cost: product.cost ? Number(product.cost) : undefined,
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

    updateItemPrice: (productId, price) => {
        const { cart } = get();
        const updatedItems = cart.items.map((item) =>
            item.productId === productId
                ? { ...item, overridePrice: price }
                : item
        );
        set({ cart: { ...cart, items: updatedItems } });
        get().calculateTotals();
    },


    clearCart: () => {
        set({
            cart: {
                items: [],
                discount: 0,
                subtotal: 0,
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

        // Step 1: sum using effective (post-item-discount) price
        const subtotal = cart.items.reduce(
            (sum, item) => sum + (item.overridePrice ?? item.price) * item.quantity,
            0
        );

        // Step 2: apply cart-level discount on top of the already-discounted subtotal
        const total = Math.max(0, subtotal - (cart.discount ?? 0));

        set({ cart: { ...cart, subtotal, total } });
    },

    loadHeldTransactions: () => {
        if (typeof window === "undefined") return;
        try {
            const stored = localStorage.getItem("pos_held_transactions");
            if (stored) {
                const parsed = JSON.parse(stored);
                set({ heldTransactions: Array.isArray(parsed) ? parsed : [] });
            }
        } catch (e) {
            console.error("Failed to load held transactions", e);
        }
    },

    holdCart: (note?: string) => {
        const { cart, customerId, customerName, heldTransactions } = get();
        if (!cart.items || cart.items.length === 0) return null;

        const nextNum = heldTransactions.length + 1;
        const holdNumber = `HOLD-${String(nextNum).padStart(3, "0")}`;

        const newHold: HeldTransaction = {
            id: `hold-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            holdNumber,
            cart: JSON.parse(JSON.stringify(cart)),
            customerId,
            customerName,
            note: note?.trim() || undefined,
            createdAt: new Date().toISOString(),
        };

        const updatedHolds = [newHold, ...heldTransactions];
        set({ heldTransactions: updatedHolds });

        if (typeof window !== "undefined") {
            try {
                localStorage.setItem("pos_held_transactions", JSON.stringify(updatedHolds));
            } catch (e) {
                console.error("Failed to save held transactions", e);
            }
        }

        get().clearCart();
        return holdNumber;
    },

    resumeHeldTransaction: (id: string) => {
        const { heldTransactions } = get();
        const target = heldTransactions.find((h) => h.id === id);
        if (!target) return false;

        set({
            cart: JSON.parse(JSON.stringify(target.cart)),
            customerId: target.customerId,
            customerName: target.customerName,
        });

        const updatedHolds = heldTransactions.filter((h) => h.id !== id);
        set({ heldTransactions: updatedHolds });

        if (typeof window !== "undefined") {
            try {
                localStorage.setItem("pos_held_transactions", JSON.stringify(updatedHolds));
            } catch (e) {
                console.error("Failed to save held transactions", e);
            }
        }

        get().calculateTotals();
        return true;
    },

    deleteHeldTransaction: (id: string) => {
        const { heldTransactions } = get();
        const updatedHolds = heldTransactions.filter((h) => h.id !== id);
        set({ heldTransactions: updatedHolds });

        if (typeof window !== "undefined") {
            try {
                localStorage.setItem("pos_held_transactions", JSON.stringify(updatedHolds));
            } catch (e) {
                console.error("Failed to save held transactions", e);
            }
        }
    },
}));