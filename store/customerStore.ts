import { Customer } from '@/app/customers/types/customer.types';
import { create } from 'zustand';

interface ApiCustomer {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    loyaltyPoints: number;
    creditBalance: number;
    totalPurchases: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

function mapApiCustomer(raw: ApiCustomer): Customer {
    return {
        id: raw.id,
        name: raw.name,
        email: raw.email ?? '',
        phone: raw.phone ?? '',
        address: raw.address ?? '',
        loyaltyPoints: raw.loyaltyPoints,
        creditBalance: raw.creditBalance,
        totalPurchases: raw.totalPurchases,
        isActive: raw.isActive,
        createdAt: new Date(raw.createdAt),
        updatedAt: new Date(raw.updatedAt),
    };
}

interface CustomerStore {
    customers: Customer[];
    inactiveCustomers: Customer[];
    search: string;
    loading: boolean;
    error: string | null;

    // Actions
    setCustomers: (customers: Customer[]) => void;
    setInactiveCustomers: (customers: Customer[]) => void;
    loadCustomers: () => Promise<void>;
    loadInactiveCustomers: () => Promise<void>;
    addCustomer: (
        customer: Omit<
            Customer,
            | 'id'
            | 'loyaltyPoints'
            | 'creditBalance'
            | 'totalPurchases'
            | 'createdAt'
            | 'updatedAt'
        >
    ) => Promise<void>;

    deactivateCustomer: (id: string) => Promise<void>;
    reactivateCustomer: (id: string) => Promise<void>;
    updateCustomer: (
        id: string,
        updatedData: Partial<Customer>
    ) => Promise<void>;
    setSearch: (search: string) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    // Computed (like your useMemo)
}

export const useCustomerStore = create<CustomerStore>()(
    (set, get) => ({
        // Initial state (your dummyCustomers)
        customers: [],
        inactiveCustomers: [],
        search: '',
        loading: false,
        error: null,

        // Actions
        setCustomers: (customers) => set({ customers }),
        setInactiveCustomers: (customers) => set({ inactiveCustomers: customers }),
        setLoading: (loading) => set({ loading }),
        setError: (error) => set({ error }),

        loadCustomers: async () => {
            set({ loading: true, error: null });
            try {
                const response = await fetch('/api/customers');
                if (!response.ok) throw new Error('Failed to load customers');
                const data = await response.json();
                set({
                    customers: (data as ApiCustomer[]).map(mapApiCustomer),
                    loading: false
                });
            } catch (error) {
                set({
                    error: error instanceof Error ? error.message : 'Failed to load customers',
                    loading: false,
                });
            }
        },

        loadInactiveCustomers: async () => {  // Add this
            set({ loading: true, error: null });
            try {
                const response = await fetch('/api/customers?showInactive=true');
                if (!response.ok) throw new Error('Failed to load inactive customers');
                const data = await response.json();
                set({
                    inactiveCustomers: (data as ApiCustomer[]).map(mapApiCustomer),
                    loading: false
                });
            } catch (error) {
                set({
                    error: error instanceof Error ? error.message : 'Failed to load inactive customers',
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
                    customers: [
                        ...state.customers,
                        mapApiCustomer(newCustomer)
                    ],
                    loading: false
                }));
            } catch (error) {
                set({
                    error: error instanceof Error ? error.message : 'Failed to add customer',
                    loading: false,
                });
                throw error;
            }
        },

        deactivateCustomer: async (id) => {
            set({ loading: true, error: null });
            const customer = get()
                .customers
                .find((c) => c.id === id);

            if (!customer) {
                set({
                    loading: false,
                    error: "Customer not found"
                });
                return;
            }
            try {
                set((state) => ({
                    inactiveCustomers: [
                        ...state.inactiveCustomers,
                        customer,
                    ],
                    customers: state.customers.filter(
                        (c) => c.id !== id
                    ),
                }));

                const response = await fetch(`/api/customers/${id}`, {
                    method: 'DELETE',
                });
                if (!response.ok) {
                    throw new Error('Failed to deactivate customer');
                }
                set({ loading: false });
            } catch (error) {
                set((state) => ({
                    customers: [
                        ...state.customers,
                        customer
                    ],
                    inactiveCustomers: state.inactiveCustomers.filter(
                        (c) => c.id !== id
                    ),
                    error: error instanceof Error
                        ? error.message
                        : 'Failed to deactivate customer',
                    loading: false,
                }));
                throw error;
            }
        },

        reactivateCustomer: async (id) => {
            set({ loading: true, error: null });

            const customer = get()
                .inactiveCustomers
                .find((c) => c.id === id);

            if (!customer) {
                set({
                    loading: false,
                    error: "Customer not found"
                });
                return;
            }

            try {

                const response = await fetch(`/api/customers/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        isActive: true
                    }),
                });

                if (!response.ok) {
                    throw new Error('Failed to reactivate customer');
                }

                const updatedCustomer = mapApiCustomer(
                    await response.json()
                );

                set((state) => ({
                    customers: [
                        ...state.customers,
                        updatedCustomer
                    ],
                    inactiveCustomers: state.inactiveCustomers.filter(
                        (c) => c.id !== id
                    ),
                    loading: false,
                }));

            } catch (error) {

                set({
                    error: error instanceof Error
                        ? error.message
                        : 'Failed to reactivate customer',
                    loading: false,
                });

                throw error;
            }
        },

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
                const updatedCustomer = mapApiCustomer(
                    await response.json()
                );
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