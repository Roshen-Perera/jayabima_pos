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

        addCustomer: async (customerData) => {
            set({ loading: true, error: null });
            try {
                const response = await fetch('/api/customers', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(customerData),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to create customer');
                }

                const newCustomer = await response.json();

                set((state) => ({
                    customers: [...state.customers, newCustomer],
                    loading: false,
                }));
            } catch (error) {
                set({
                    error: error instanceof Error ? error.message : 'Failed to add customer',
                    loading: false,
                });
                throw error;
            }
        },

        deleteCustomer: (id) =>
            set((state) => ({
                customers: state.customers.filter((c) => c.id !== id),
            })),

        setSearch: (search) => set({ search }),
        updateCustomer: async (id, updatedData) => {
            set({ loading: true, error: null });
            try {
                const response = await fetch(`/api/customers/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedData),
                });
                if (!response.ok) throw new Error('Failed to update customer');
                const updatedCustomer = await response.json();
                set((state) => ({
                    customers: state.customers.map((c) =>
                        c.id === id ? updatedCustomer : c
                    ),
                    loading: false,
                }));
            } catch (error) {
                set({
                    error: error instanceof Error ? error.message : 'Failed to update customer',
                    loading: false,
                });
                throw error;
            }
        }
    }),
);