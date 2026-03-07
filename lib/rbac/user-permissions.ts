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