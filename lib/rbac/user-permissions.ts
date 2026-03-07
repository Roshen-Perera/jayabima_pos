import { UserRole } from "./permissions";

export function canCreateRole(userRole: UserRole, targetRole: UserRole): boolean {
    if (userRole === 'ADMIN') {
        return true; // Admin can create anyone
    }
    return false; // Managers and Cashiers cannot create roles
}