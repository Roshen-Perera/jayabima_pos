import { create } from 'zustand';
import { Supplier } from './../app/suppliers/types/supplier.types';
import { dummySuppliers } from '@/data/data';

interface SupplierStore {
    suppliers: Supplier[];

    setSuppliers: (suppliers: Supplier[]) => void;
}


export const useSupplierStore = create<SupplierStore>()((set) => ({
    suppliers: dummySuppliers,

    setSuppliers: (suppliers) => set({ suppliers }),
}));