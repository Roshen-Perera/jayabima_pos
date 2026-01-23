import { Product } from "@/app/inventory/_types/product.types";
import { dummyProducts } from "@/data/data";
import { create } from "zustand";


interface ProductStore {
    products: Product[];
    search: string;
    categoryFilter: string;

    setProducts: (products: Product[]) => void;
    addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
    updateProduct: (id: string, updates: Partial<Product>) => void;
    deleteProduct: (id: string) => void;
    updateStock: (id: string, quantity: number) => void;
    setSearch: (search: string) => void;
    setCategoryFilter: (category: string) => void;
}

export const useProductStore = create<ProductStore>()((set) => ({
    products: dummyProducts,
    search: '',
    categoryFilter: 'all',

    setProducts: (products) => set({ products }),

    addProduct: (productData) =>
        set((state) => ({
            products: [
                ...state.products,
                {
                    id: Date.now().toString(),
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