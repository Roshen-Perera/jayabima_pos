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
    
    },

    addProduct: (productData) =>
        set((state) => ({
            products: [
                ...state.products,
                {
                    id: "ITM-" + Date.now().toString(),
                    ...productData,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ],
        })),

    updateProduct: (id, updates) =>
        set((state) => ({
            products: state.products.map((product) =>
                product.id === id
                    ? { ...product, ...updates, updatedAt: new Date() }
                    : product
            ),
        })),

    deleteProduct: (id) =>
        set((state) => ({
            products: state.products.filter((p) => p.id !== id),
        })),

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