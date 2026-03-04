import { ReactNode } from "react";
import { Permission } from "./permissions";
import { usePermissions } from "@/hooks/usePermissions";


interface PermissionGuardProps {
  children: ReactNode;
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean;
  fallback?: ReactNode;
}

export default function PermissionGuard({
  children,
  permission,
  permissions,
  requireAll = false,
  fallback = null,
}: PermissionGuardProps) {
    const { can, canAny, canAll } = usePermissions();

    let hasAccess = false;

    if (permission) {
      hasAccess = can(permission);
    } else if (permissions) {
      hasAccess = requireAll ? canAll(permissions) : canAny(permissions);
    }
}