import { Product } from "@/app/inventory/_types/product.types";
import { dummyProducts } from "@/data/data";
import { create } from "zustand";


interface ProductStore {
    products: Product[];
    inactiveProducts: Product[];
    search: string;
    categoryFilter: string;
    loading: boolean;
    error: string | null;

    setProducts: (products: Product[]) => void;
    setInactiveProducts: (products: Product[]) => void;
    loadProducts: () => Promise<void>;
    loadInactiveProducts: () => Promise<void>;
    addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
    updateProduct: (id: string, updates: Partial<Product>) => void;
    deactivateProduct: (id: string) => Promise<void>;
    reactivateProduct: (id: string) => Promise<void>;
    updateStock: (id: string, quantity: number) => void;
    setSearch: (search: string) => void;
    setCategoryFilter: (category: string) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
}

export const useProductStore = create<ProductStore>()((set) => ({
    products: [],
    inactiveProducts: [],
    search: '',
    categoryFilter: 'all',
    loading: false,
    error: null,

    setProducts: (products) => set({ products }),
    setInactiveProducts: (inactiveProducts) => set({ inactiveProducts }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),

    loadProducts: async () => {
        set({ loading: true, error: null });
        try {
            const response = await fetch('/api/inventory?showInactive=false');
            if (!response.ok) throw new Error('Failed to load products');
            const data = await response.json();
            set({ products: data, loading: false });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to load products',
                loading: false,
            });
        }
    },

    loadInactiveProducts: async () => {
        set({ loading: true, error: null });
        try {
            const response = await fetch('/api/inventory?showInactive=true');
            if (!response.ok) throw new Error('Failed to load inactive products');
            const data = await response.json();
            set({ inactiveProducts: data, loading: false });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to load inactive products',
                loading: false,
            });
        }
    },

    addProduct: async (productData) => {
        set({ loading: true, error: null });
        try {
            const response = await fetch('/api/inventory', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create product');
            }

            const newProduct = await response.json();

            set((state) => ({
                products: [...state.products, newProduct],
                loading: false,
            }));
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to add product',
                loading: false,
            });
            throw error;
        }
    },

    updateProduct: async (id, updates) => {
        set({ loading: true, error: null });
        try {
            const response = await fetch(`/api/inventory/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
            });
            if (!response.ok) throw new Error('Failed to update product');
            const updatedProduct = await response.json();
            set((state) => ({
                products: state.products.map((p) =>
                    p.id === id ? updatedProduct : p
                ),
                loading: false,
            }));
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to update product',
                loading: false,
            });
            throw error;
        }
    },

    deactivateProduct: async (id) => {
        set({ loading: true, error: null });
        try {
            set((state) => ({
                inactiveProducts: [
                    ...state.inactiveProducts,
                    state.products.find((p) => p.id === id)!,
                ],
                products: state.products.filter((p) => p.id !== id),
            }));
            const response = await fetch(`/api/inventory/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to deactivate product');
            set({ loading: false });
        } catch (error) {
            set((state) => {
                const inactiveProduct = state.inactiveProducts.find((p) => p.id === id);
                return {
                    products: inactiveProduct
                        ? [...state.products, inactiveProduct]
                        : state.products,
                    inactiveProducts: state.inactiveProducts.filter((p) => p.id !== id),
                    error: error instanceof Error ? error.message : 'Failed to deactivate product',
                    loading: false,
                };
            });
            throw error;
        }
    },

    reactivateProduct: async (id) => {
        set({ loading: true, error: null });
        try {
            set((state) => ({
                products: [
                    ...state.products,
                    state.inactiveProducts.find((p) => p.id === id)!,
                ],
                inactiveProducts: state.inactiveProducts.filter((p) => p.id !== id),
            }));
            const response = await fetch(`/api/inventory/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ active: true }),
            });
            if (!response.ok) throw new Error('Failed to reactivate product');
        } catch (error) {

        }
    },

    updateStock: (id, quantity) =>
        set((state) => ({
            products: state.products.map((product) =>
                product.id === id
                    ? {
                        ...product,
                        stock: product.stock - quantity,
                        updatedAt: new Date()
                    }
                    : product
            ),
        })),

    setSearch: (search) => set({ search }),

    setCategoryFilter: (category) => set({ categoryFilter: category }),
}));