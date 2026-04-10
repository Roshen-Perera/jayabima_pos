import { Customer } from '@/app/customers/types/customer.types';
import { dummyCustomers } from '@/data/data';
import { create } from 'zustand';
interface CustomerStore {
    customers: Customer[];
    search: string;
    loading: boolean;
    error: string | null;

    // Actions
    setCustomers: (customers: Customer[]) => void;
    loadCustomers: () => Promise<void>;
    addCustomer: (customer: Omit<Customer, 'id' | 'loyaltyPoints' | 'creditBalance'>) => void;
    deleteCustomer: (id: string) => void;
    updateCustomer: (id: string, updatedData: Partial<Customer>) => void;
    setSearch: (search: string) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    // Computed (like your useMemo)
}

export const useCustomerStore = create<CustomerStore>()(
    (set) => ({
        // Initial state (your dummyCustomers)
        customers: [],
        search: '',
        loading: false,
        error: null,

        // Actions
        setCustomers: (customers) => set({ customers }),
        setLoading: (loading) => set({ loading }),
        setError: (error) => set({ error }),

        loadCustomers: async () => {
            set({ loading: true, error: null });
            try {
                const response = await fetch('/api/customers');
                if (!response.ok) throw new Error('Failed to load customers');
                const data = await response.json();
                set({ customers: data, loading: false });
            } catch (error) {
                set({
                    error: error instanceof Error ? error.message : 'Failed to load customers',
                    loading: false,
                });
            }
        },

        addCustomer: (customerData) =>
            

        deleteCustomer: (id) =>
            set((state) => ({
                customers: state.customers.filter((c) => c.id !== id),
            })),

        setSearch: (search) => set({ search }),
        updateCustomer: (id, updatedData) =>
            set((state) => ({
                customers: state.customers.map((customer) =>
                    customer.id === id ? { ...customer, ...updatedData } : customer
                ),
            })),
    }),
);