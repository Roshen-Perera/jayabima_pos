import { create } from 'zustand';
import { Supplier } from './../app/suppliers/types/supplier.types';
import { dummySuppliers } from '@/data/data';

interface SupplierStore {
    suppliers: Supplier[];
    search: string;

    setSuppliers: (suppliers: Supplier[]) => void;
    addSupplier: (supplier: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>) => void;
    updateSupplier: (id: string, updatedData: Partial<Supplier>) => void;
    deleteSupplier: (id: string) => void;
    setSearch: (search: string) => void;
}


export const useSupplierStore = create<SupplierStore>()((set) => ({
    suppliers: dummySuppliers,
    search: '',

    setSuppliers: (suppliers) => set({ suppliers }),
    addSupplier: (supplier) => set((state) => ({
        suppliers: [...state.suppliers, {
            ...supplier,
            id: "SUP-" + Date.now().toString(),
            createdAt: new Date(),
            updatedAt: new Date(),
        }]
    })),
    updateSupplier: (id, updates) =>
        set((state) => ({
            suppliers: state.suppliers.map((supplier) =>
                supplier.id === id
                    ? { ...supplier, ...updates, updatedAt: new Date() }
                    : supplier
            ),
        })),
    deleteSupplier: (id) =>
        set((state) => ({
            suppliers: state.suppliers.filter((s) => s.id !== id),
        })),
    setSearch: (search) => set({ search }),
}));