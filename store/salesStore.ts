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
}