import { ReactNode } from "react";
import { UserRole } from "./permissions";


interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: UserRole[];
  fallback?: ReactNode;
}