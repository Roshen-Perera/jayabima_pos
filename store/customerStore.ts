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
        customers: dummyCustomers,
        search: '',
        loading: false,
        error: null,

        // Actions
        setCustomers: (customers) => set({ customers }),
        loadCustomers: () => Promise<void>,
        addCustomer: (customerData) =>
            set((state) => ({
                customers: [
                    ...state.customers,
                    {
                        id: "CUS-" + Date.now().toString(),
                        ...customerData,
                        loyaltyPoints: 0,
                        creditBalance: 0,
                        totalPurchases: 0,
                    },
                ],
            })),

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