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
}));