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

            if (dateFilter === 'today') {
                matchesDate = saleDate.toDateString() === now.toDateString();
            } else if (dateFilter === 'week') {
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                matchesDate = saleDate >= weekAgo;
            } else if (dateFilter === 'month') {
                const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                matchesDate = saleDate >= monthAgo;
            }
            const matchesPayment =
                paymentFilter === 'all' || sale.paymentMethod === paymentFilter;
            return matchesSearch && matchesDate && matchesPayment;
        });
    },
    getTodayStats: () => {
        const { sales } = get();
        const today = new Date().toDateString();
        const todaySales = sales.filter(
            (sale) => new Date(sale.createdAt).toDateString() === today
        );

        const totalSales = todaySales.length;
        const totalRevenue = todaySales.reduce((sum, sale) => sum + sale.total, 0);
        const totalItems = todaySales.reduce(
            (sum, sale) => sum + sale.items.reduce((s, item) => s + item.quantity, 0),
            0
        );
        const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;

        return {
            totalSales,
            totalRevenue,
            totalItems,
            averageOrderValue,
        };
    }

}));