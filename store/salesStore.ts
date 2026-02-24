import { create } from 'zustand';
import { Sale } from '@/app/pos/_types/pos.types';

interface SalesState {
    sales: Sale[];
    selectedSale: Sale | null;

    isLoading: boolean;
    searchQuery: string;
    dateFilter: 'today' | 'week' | 'month' | 'all';
    paymentFilter: string;

    addSale: (sale: Sale) => void;
    fetchSales: () => Promise<void>;
    setSelectedSale: (sale: Sale | null) => void;
    setSearchQuery: (query: string) => void;
    setDateFilter: (filter: 'today' | 'week' | 'month' | 'all') => void;
    setPaymentFilter: (filter: string) => void;
    getFilteredSales: () => Sale[];
    getTodayStats: () => {
        totalSales: number;
        totalRevenue: number;
        totalItems: number;
        averageOrderValue: number;
    };
}

export const useSalesStore = create<SalesState>((set, get) => ({
    sales: [],
    selectedSale: null,
    isLoading: false,
    searchQuery: '',
    dateFilter: 'today',
    paymentFilter: 'all',

    addSale: (sale) => {
        set((state) => ({
            sales: [sale, ...state.sales],
        }));
    },

    fetchSales: async () => {
        set({ isLoading: true });
        try {
            // TODO: Later replace with API call
            await new Promise((resolve) => setTimeout(resolve, 300));
        } catch (error) {
            console.error('Fetch sales error:', error);
        } finally {
            set({ isLoading: false });
        }
    },

    setSelectedSale: (sale) => set({ selectedSale: sale }),
    setSearchQuery: (query) => set({ searchQuery: query }),
    setDateFilter: (filter) => set({ dateFilter: filter }),
    setPaymentFilter: (filter) => set({ paymentFilter: filter }),

    getFilteredSales: () => {
        const { sales, searchQuery, dateFilter, paymentFilter } = get();
        return sales.filter((sale) => {
            const matchesSearch =
                !searchQuery ||
                sale.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                sale.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                sale.items.some((item) =>
                    item.name.toLowerCase().includes(searchQuery.toLowerCase())
                );
            const now = new Date();
            const saleDate = new Date(sale.createdAt);
            let matchesDate = true;
        });
    }
}));