import { create } from 'zustand';
import { Supplier, SupplierFormData } from './../app/suppliers/types/supplier.types';

interface SupplierStore {
    suppliers: Supplier[];
    search: string;
    loading: boolean;
    error: string | null;

    fetchSuppliers: () => Promise<void>;
    setSuppliers: (suppliers: Supplier[]) => void;
    addSupplier: (supplier: SupplierFormData) => Promise<Supplier>;
    updateSupplier: (id: string, updatedData: Partial<SupplierFormData>) => Promise<void>;
    deleteSupplier: (id: string) => Promise<void>;
    setSearch: (search: string) => void;
}

export const useSupplierStore = create<SupplierStore>()((set, get) => ({
    suppliers: [],
    search: '',
    loading: false,
    error: null,

    fetchSuppliers: async () => {
        set({ loading: true, error: null });
        try {
            const res = await fetch('/api/suppliers?includeInactive=true');
            if (!res.ok) throw new Error('Failed to fetch suppliers');
            const data = await res.json();
            set({ suppliers: data, loading: false });
        } catch (err: any) {
            console.error('Error in fetchSuppliers:', err);
            set({ error: err.message || 'Error fetching suppliers', loading: false });
        }
    },

    setSuppliers: (suppliers) => set({ suppliers }),

    addSupplier: async (supplierData) => {
        set({ loading: true, error: null });
        try {
            const res = await fetch('/api/suppliers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(supplierData),
            });
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || 'Failed to add supplier');
            }
            const newSupplier: Supplier = await res.json();
            set((state) => ({
                suppliers: [newSupplier, ...state.suppliers],
                loading: false,
            }));
            return newSupplier;
        } catch (err: any) {
            set({ loading: false, error: err.message });
            throw err;
        }
    },

    updateSupplier: async (id, updates) => {
        set({ loading: true, error: null });
        try {
            const res = await fetch(`/api/suppliers/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
            });
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || 'Failed to update supplier');
            }
            const updatedSupplier: Supplier = await res.json();
            set((state) => ({
                suppliers: state.suppliers.map((s) => (s.id === id ? updatedSupplier : s)),
                loading: false,
            }));
        } catch (err: any) {
            set({ loading: false, error: err.message });
            throw err;
        }
    },

    deleteSupplier: async (id) => {
        set({ loading: true, error: null });
        try {
            const res = await fetch(`/api/suppliers/${id}`, {
                method: 'DELETE',
            });
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || 'Failed to delete supplier');
            }
            set((state) => ({
                suppliers: state.suppliers.filter((s) => s.id !== id),
                loading: false,
            }));
        } catch (err: any) {
            set({ loading: false, error: err.message });
            throw err;
        }
    },

    setSearch: (search) => set({ search }),
}));