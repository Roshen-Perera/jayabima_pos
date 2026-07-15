import { Product } from "@/app/inventory/_types/product.types";
import { create } from "zustand";

interface ApiProduct {
    id: string;
    name: string;
    category: string;
    sku: string;
    barcode: string | null;
    supplierId?: string | null;
    price: number;
    cost: number;
    stock: number;
    minStock: number;
    description?: string | null;
    active: boolean;
    image?: string | null;
    createdAt: string;
    updatedAt: string;
}

function mapApiProduct(raw: ApiProduct): Product {
    return {
        id: raw.id,
        name: raw.name,
        category: raw.category,
        sku: raw.sku,
        barcode: raw.barcode ?? undefined,
        supplierId: raw.supplierId ?? undefined,
        price: raw.price,
        cost: raw.cost,
        stock: raw.stock,
        minStock: raw.minStock,
        description: raw.description ?? undefined,
        active: raw.active,
        image: raw.image ?? undefined,
        createdAt: new Date(raw.createdAt),
        updatedAt: new Date(raw.updatedAt),
    };
}

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
    addProduct: (
        product: Partial<Omit<Product, "id" | "createdAt" | "updatedAt">>,
    ) => Promise<void>;
    updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
    deactivateProduct: (id: string) => Promise<void>;
    reactivateProduct: (id: string) => Promise<void>;
    updateStock: (id: string, quantity: number) => Promise<void>;
    setSearch: (search: string) => void;
    setCategoryFilter: (category: string) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
}

export const useProductStore = create<ProductStore>()((set, get) => ({
    products: [],
    inactiveProducts: [],
    search: "",
    categoryFilter: "all",
    loading: false,
    error: null,

    setProducts: (products) => set({ products }),
    setInactiveProducts: (inactiveProducts) => set({ inactiveProducts }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),

    loadProducts: async () => {
        set({ loading: true, error: null });
        try {
            const response = await fetch("/api/inventory?showInactive=false");
            if (!response.ok) throw new Error("Failed to load products");
            const data = await response.json();
            set({
                products: (data as ApiProduct[]).map(mapApiProduct),
                loading: false,
            });
        } catch (error) {
            set({
                error:
                    error instanceof Error ? error.message : "Failed to load products",
                loading: false,
            });
        }
    },

    loadInactiveProducts: async () => {
        set({ loading: true, error: null });
        try {
            const response = await fetch("/api/inventory?showInactive=true");
            if (!response.ok) throw new Error("Failed to load inactive products");
            const data = await response.json();
            set({
                inactiveProducts: (data as ApiProduct[]).map(mapApiProduct),
                loading: false,
            });
        } catch (error) {
            set({
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to load inactive products",
                loading: false,
            });
        }
    },

    addProduct: async (productData) => {
        set({ loading: true, error: null });
        try {
            const response = await fetch("/api/inventory", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...productData,
                    stock: productData.stock ?? 0,
                    minStock: productData.minStock ?? 0,
                    active: productData.active ?? true,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to create product");
            }

            const newProduct = await response.json();

            set((state) => ({
                products: [...state.products, mapApiProduct(newProduct)],
                loading: false,
            }));
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : "Failed to add product",
                loading: false,
            });
            throw error;
        }
    },

    updateProduct: async (id, updates) => {
        set({ loading: true, error: null });
        try {
            const response = await fetch(`/api/inventory/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updates),
            });
            if (!response.ok) throw new Error("Failed to update product");
            const updatedProduct = mapApiProduct(await response.json());
            set((state) => ({
                products: state.products.map((p) => (p.id === id ? updatedProduct : p)),
                loading: false,
            }));
        } catch (error) {
            set({
                error:
                    error instanceof Error ? error.message : "Failed to update product",
                loading: false,
            });
            throw error;
        }
    },

    deactivateProduct: async (id) => {
        set({ loading: true, error: null });
        try {
            set((state) => ({
                inactiveProducts: (() => {
                    const product = state.products.find((p) => p.id === id);
                    return product
                        ? [...state.inactiveProducts, product]
                        : state.inactiveProducts;
                })(),
                products: state.products.filter((p) => p.id !== id),
            }));
            const response = await fetch(`/api/inventory/${id}`, {
                method: "DELETE",
            });
            if (!response.ok) throw new Error("Failed to deactivate product");
            set({ loading: false });
        } catch (error) {
            set((state) => {
                const inactiveProduct = state.inactiveProducts.find((p) => p.id === id);
                return {
                    products: inactiveProduct
                        ? [...state.products, inactiveProduct]
                        : state.products,
                    inactiveProducts: state.inactiveProducts.filter((p) => p.id !== id),
                    error:
                        error instanceof Error
                            ? error.message
                            : "Failed to deactivate product",
                    loading: false,
                };
            });
            throw error;
        }
    },

    reactivateProduct: async (id) => {
        set({ loading: true, error: null });
        try {
            const response = await fetch(`/api/inventory/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ active: true }),
            });

            if (!response.ok) {
                throw new Error("Failed to reactivate product");
            }

            const updatedProduct = mapApiProduct(await response.json());

            set((state) => ({
                products: [...state.products, updatedProduct],
                inactiveProducts: state.inactiveProducts.filter((p) => p.id !== id),
                loading: false,
            }));
        } catch (error) {
            set((state) => {
                const activeProduct = state.products.find((p) => p.id === id);
                return {
                    inactiveProducts: activeProduct
                        ? [...state.inactiveProducts, activeProduct]
                        : state.inactiveProducts,
                    products: state.products.filter((p) => p.id !== id),
                    error:
                        error instanceof Error
                            ? error.message
                            : "Failed to reactivate product",
                    loading: false,
                };
            });
            throw error;
        }
    },

    updateStock: async (id, quantity) => {
        set({ loading: true, error: null });
        try {
            // Get the current product to calculate new stock (deduction)
            const currentProduct = get().products.find((p) => p.id === id);
            if (!currentProduct) {
                throw new Error("Product not found");
            }

            // Deduct quantity from existing stock (prevent negative stock)
            const newStock = Math.max(0, currentProduct.stock - quantity);

            const response = await fetch(`/api/inventory/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ stock: newStock }),
            });
            if (!response.ok) throw new Error("Failed to update stock");
            const updatedProduct = mapApiProduct(await response.json());
            set((state) => ({
                products: state.products.map((p) => (p.id === id ? updatedProduct : p)),
                loading: false,
            }));
        } catch (error) {
            set({
                error:
                    error instanceof Error ? error.message : "Failed to update stock",
                loading: false,
            });
            throw error;
        }
    },

    setSearch: (search) => set({ search }),
    setCategoryFilter: (category) => set({ categoryFilter: category }),
}));
