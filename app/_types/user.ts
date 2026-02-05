export type UserRole = 'ADMIN' | 'MANAGER' | 'CASHIER';

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export interface User {
    id: string;
    username: string;
    email: string;
    name: string;
    role: UserRole;
    phone?: string | null;
    avatar?: string | null;
    isActive: boolean;
    status: UserStatus;
    createdAt: Date;
    updatedAt: Date;
    lastLogin?: Date | null;
}

export interface CreateUserInput {
    username: string;
    email: string;
    password: string;
    name: string;
    role?: UserRole;
    phone?: string;
    avatar?: string;
}

export interface UpdateUserInput {
    username?: string;
    email?: string;
    name?: string;
    role?: UserRole;
    phone?: string;
    avatar?: string;
    isActive?: boolean;
    status?: UserStatus;
}

export interface ChangePasswordInput {
    currentPassword: string;
    newPassword: string;
}
