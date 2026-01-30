import { create } from 'zustand';
import { Supplier } from './../app/suppliers/types/supplier.types';
import { dummySuppliers } from '@/data/data';

interface SupplierStore {
    suppliers: Supplier[];
    search: string;

    setSuppliers: (suppliers: Supplier[]) => void;
    setSearch: (search: string) => void;
}


export const useSupplierStore = create<SupplierStore>()((set) => ({
    suppliers: dummySuppliers,
    search: '',

    setSuppliers: (suppliers) => set({ suppliers }),
    setSearch: (search) => set({ search }),
}));