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


}));