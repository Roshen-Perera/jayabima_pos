import { fa } from "zod/v4/locales";
import { UserRole } from "./permissions";

export function canCreateRole(userRole: UserRole, targetRole: UserRole): boolean {
    if (userRole === 'ADMIN') {
        return true; // Admin can create anyone
    }
    if (userRole === 'MANAGER') {
        return targetRole === 'CASHIER'; // Manager can only create cashiers
    }
    return false; // Managers and Cashiers cannot create roles
}

export function canEditUser(
    userRole: UserRole,
    targetUserRole: UserRole,
    isSelf: boolean
): boolean {
    if (isSelf) {
        return true; // Everyone can edit themselves
    }
    if (userRole === 'ADMIN') {
        return true; // Admin can edit anyone
    }
    if (userRole === 'MANAGER') {
        return targetUserRole === 'CASHIER'; // Manager can only edit cashiers
    }
    return false; // No one can edit users, including themselves, as per requirements
}

export function canResetUserPassword(
    userRole: UserRole,
    targetUserRole: UserRole
): boolean {
    if (userRole === 'ADMIN') {
        return true; // Admin can reset anyone's password
    }
    if (userRole === 'MANAGER') {
        return targetUserRole === 'CASHIER'; // Manager can only reset cashier passwords
    }
    return false; // Cashiers cannot reset any passwords
}

// Check if user can delete another user
export function canDeleteUser(
    userRole: UserRole,
    targetUserRole: UserRole
): boolean {
    if (userRole === 'ADMIN') {
        return true; // Admin can delete anyone
    }
    return false; // No one can delete users, including themselves, as per requirements
}

// Get list of roles that a user can create based on their role
export function getAllowedRolesToCreate(userRole: UserRole): UserRole[] {
    switch (userRole) {
        case 'ADMIN':
            return ['MANAGER', 'CASHIER'];
        case 'MANAGER':
            return ['CASHIER'];
        default:
            return [];
    }
}