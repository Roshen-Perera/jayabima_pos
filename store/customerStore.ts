import { Customer } from '@/app/customers/types/customer.types';
import { dummyCustomers } from '@/data/data';
import { create } from 'zustand';
interface CustomerStore {
    customers: Customer[];
    search: string;

    // Actions
    setCustomers: (customers: Customer[]) => void;
    addCustomer: (customer: Omit<Customer, 'id' | 'loyaltyPoints' | 'creditBalance'>) => void;
    deleteCustomer: (id: string) => void;
    setSearch: (search: string) => void;
    // Computed (like your useMemo)
}

export const useCustomerStore = create<CustomerStore>()(
    (set) => ({
        // Initial state (your dummyCustomers)
        customers: dummyCustomers,
        search: '',

        // Actions
        setCustomers: (customers) => set({ customers }),

        addCustomer: (customerData) =>
            set((state) => ({
                customers: [
                    ...state.customers,
                    {
                        id: Date.now().toString(),
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
    }),
);