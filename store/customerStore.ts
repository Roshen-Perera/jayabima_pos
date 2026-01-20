import { Customer } from '@/app/customers/types/customer.types';
import { dummyCustomers } from '@/data/data';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CustomerStore {
    getFilteredCustomers(): any;
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
    persist(
        (set, get) => ({
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

            // Computed value (replaces your useMemo)
            getFilteredCustomers: () => {
                const { customers, search } = get();
                if (!search) return customers;

                const keyword = search.toLowerCase();
                return customers.filter(
                    (c) =>
                        c.name.toLowerCase().includes(keyword) ||
                        c.email.toLowerCase().includes(keyword) ||
                        c.address.toLowerCase().includes(keyword) ||
                        c.phone.includes(keyword)
                );
            },
        }),
        {
            name: 'customer-storage', // Persists to localStorage!
        }
    )
);