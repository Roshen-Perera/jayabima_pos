import { Employee } from "@/types/employee.type";
import { UserRole } from "./useAuthStore";
import { create } from "zustand";
import { alert } from "@/lib/alert";

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
    statusFilter: 'all',

    fetchEmployees: async () => {
        set({ isLoading: true });
        try {
            const { searchQuery, roleFilter, statusFilter } = get();
            const params = new URLSearchParams();
            if (searchQuery) params.set('search', searchQuery);
            if (roleFilter !== 'all') params.set('role', roleFilter);
            if (statusFilter !== 'all') params.set('isActive', statusFilter);
            const response = await fetch(`/api/employees?${params}`, {
                credentials: 'include',
            });
            const data = await response.json();
            if (data.success) {
                set({ employees: data.employees });
            } else {
                alert.error('Failed to load employees', data.message || 'Could not fetch employees');
            }
        } catch (error) {
            console.error('Fetch employees error:', error);
            alert.error('Error', 'Something went wrong while fetching employees');
        } finally {
            set({ isLoading: false });
        }
    },

    fetchEmployeeById: async (id) => {
        set({ isLoading: true });
        try {
            const response = await fetch(`/api/employees/${id}`, {
                credentials: 'include',
            });

            const data = await response.json();

            if (data.success) {
                set({ selectedEmployee: data.employee });
            } else {
                alert.error('Failed to load employee', data.message || 'Could not fetch employee');
            }
        } catch (error) {
            console.error('Fetch employee error:', error);
            alert.error('Error', 'Something went wrong');
        } finally {
            set({ isLoading: false });
        }
    },
    createEmployee: async (data) => {
        set({ isSubmitting: true });
        try {
            const response = await fetch('/api/employees', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(data),
            });
            const result = await response.json();
            if (result.success) {
                alert.success(
                    'Employee created!',
                    `${data.name} has been added. Login credentials sent to ${data.email}`
                );

                // Add to local state
                set((state) => ({
                    employees: [result.employee, ...state.employees],
                }));

                // Refresh list
                get().fetchEmployees();

                return {
                    success: true,
                    temporaryPassword: result.temporaryPassword, // Fallback if email fails
                };
            } else {
                alert.error('Failed to create employee', result.message || 'Could not create employee');
                return { success: false };
            }
        } catch (error) {
            console.error('Create employee error:', error);
            alert.error('Error', 'Something went wrong');
            return { success: false };
        } finally {
            set({ isSubmitting: false });
        }
    },

    updateEmployee: async (id, data) => {
        set({ isSubmitting: true });
        try {
            const response = await fetch(`/api/employees/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(data),
            });
            const result = await response.json();

            if (result.success) {
                alert.success('Employee updated!', 'Changes have been saved');

                // Update in local state
                set((state) => ({
                    employees: state.employees.map((emp) =>
                        emp.id === id ? { ...emp, ...result.employee } : emp
                    ),
                }));

                return true;
            } else {
                alert.error('Update failed', result.message || 'Could not update employee');
                return false;
            }
        } catch (error) {
            console.error('Update employee error:', error);
            alert.error('Error', 'Something went wrong');
            return false;
        } finally {
            set({ isSubmitting: false });
        }
    },
    deleteEmployee: async (id) => {
        set({ isSubmitting: true });

        try {
            const response = await fetch(`/api/employees/${id}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            const result = await response.json();
            if (result.success) {
                alert.success('Employee deactivated', 'Employee has been deactivated');

                // Update in local state (soft delete)
                set((state) => ({
                    employees: state.employees.map((emp) =>
                        emp.id === id ? { ...emp, isActive: false, status: 'INACTIVE' as const } : emp
                    ),
                }));

                return true;
            } else {
                alert.error('Delete failed', result.message || 'Could not delete employee');
                return false;
            }
        } catch (error) {
            console.error('Delete employee error:', error);
            alert.error('Error', 'Something went wrong');
            return false;
        } finally {
            set({ isSubmitting: false });
        }
    },
    resetEmployeePassword: async (id) => {
        set({ isSubmitting: true });
        try {

        } catch (error) {
            const response = await fetch(`/api/employees/${id}/reset-password`, {
                method: 'POST',
                credentials: 'include',
            });
        }
    }

}));