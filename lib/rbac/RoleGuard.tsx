import { ReactNode } from "react";
import { UserRole } from "./permissions";
import { usePermissions } from "@/hooks/usePermissions";


interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: UserRole[];
  fallback?: ReactNode;
}

export default function RoleGuard({
  children,
  allowedRoles,
  fallback = null,
}: RoleGuardProps) {
    const { role } = usePermissions();
    if (!role || !allowedRoles.includes(role)) {
        return <>{fallback}</>;
    }
}