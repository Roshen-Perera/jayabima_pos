import { UserRole, UserStatus } from "./user.types";

export interface Employee {
    id: string;
    username: string;
    email: string;
    name: string;
    role: UserRole;
    phone?: string | null;
    isActive: boolean;
    status: UserStatus;
    createdAt: Date;
    updatedAt: Date;
    lastLogin?: Date | null;
}

export interface CreateEmployeeData {
    username: string;
    email: string;
    name: string;
    phone?: string | null;
    role: UserRole;
    password: string;
}

export interface UpdateEmployeeData {
    name?: string;
    email?: string;
    phone?: string | null;
    role?: UserRole;
    isActive?: boolean;
    status?: UserStatus;
}

export interface ChangePasswordData {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export interface UpdateProfileData {
    name: string;
    email: string;
    phone?: string;
}

export interface EmployeeFilters {
    search?: string;
    role?: UserRole | 'all';
    status?: 'active' | 'inactive' | 'all';
}
