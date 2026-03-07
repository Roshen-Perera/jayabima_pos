import { UserRole } from "./user.types";

export interface Employee {
    id: string;
    username: string;
    email: string;
    name: string;
    phone?: string;
    role: UserRole;
    isActive: boolean;
    status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
    createdAt: Date;
    updatedAt: Date;
    lastLogin?: Date;
}

export interface CreateEmployeeData {
    username: string;
    email: string;
    name: string;
    phone?: string;
    role: UserRole;
    password: string;
}

export interface UpdateEmployeeData {
    name?: string;
    email?: string;
    phone?: string;
    role?: UserRole;
    isActive?: boolean;
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