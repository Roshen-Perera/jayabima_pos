import { Employee } from "@/types/employee.type";
import { UserRole } from "./useAuthStore";
import { create } from "zustand";

interface EmployeeState {
    employees: Employee[];
    selectedEmployee: Employee | null;

    isLoading: boolean;
    isSubmitting: boolean;
    searchQuery: string;
    roleFilter: string;
    statusFilter: string;

    fetchEmployees: () => Promise<void>;
    fetchEmployeeById: (id: string) => Promise<void>;
    createEmployee: (data: {
        username: string;
        email: string;
        name: string;
        phone?: string;
        role: UserRole;
    }) => Promise<{ success: boolean; temporaryPassword?: string }>;
    updateEmployee: (id: string, data: Partial<Employee>) => Promise<boolean>;
    deleteEmployee: (id: string) => Promise<boolean>;
    resetEmployeePassword: (id: string) => Promise<{
        success: boolean;
        temporaryPassword?: string
    }>;
    setSelectedEmployee: (employee: Employee | null) => void;
    setSearchQuery: (query: string) => void;
    setRoleFilter: (role: string) => void;
    setStatusFilter: (status: string) => void;
}

export const useEmployeeStore = create<EmployeeState>((set, get) => ({
    employees: [],
    selectedEmployee: null,
    isLoading: false,
    isSubmitting: false,
    searchQuery: '',
    roleFilter: 'all',
    statusFilter: 'all'

      fetchEmployees: async () => {
        set({ isLoading: true });
    },
}));