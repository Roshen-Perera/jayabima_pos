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