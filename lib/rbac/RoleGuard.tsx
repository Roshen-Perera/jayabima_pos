import { ReactNode } from "react";
import { UserRole } from "./permissions";


interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: UserRole[];
  fallback?: ReactNode;
}

export default function RoleGuard({
  children,
  allowedRoles,
  fallback = null,
}: RoleGuardProps) {}