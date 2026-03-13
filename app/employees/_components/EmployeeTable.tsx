import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { usePermissions } from "@/hooks/usePermissions";
import { UserRole } from "@/lib/rbac/permissions";
import {
  canDeleteUser,
  canEditUser,
  canResetUserPassword,
} from "@/lib/rbac/user-permissions";
import { Employee } from "@/types/employee.type";

interface EmployeeTableProps {
  employees: Employee[];
  onEdit: (employee: Employee) => void;
  onResetPassword: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
}

export default function EmployeeTable({
  employees,
  onEdit,
  onResetPassword,
  onDelete,
}: EmployeeTableProps) {
  const { role, user } = usePermissions();
  const getRoleBadgeVariant = (employeeRole: string) => {
    switch (employeeRole) {
      case "ADMIN":
        return "destructive";
      case "MANAGER":
        return "default";
      case "CASHIER":
        return "secondary";
      default:
        return "outline";
    }
  };

  const canPerformAction = (
    employee: Employee,
    action: "edit" | "reset" | "delete",
  ) => {
    if (!role || !user) return false;
    const isSelf = user.id === employee.id;
    const targetRole = employee.role as UserRole;
    switch (action) {
      case "edit":
        return canEditUser(role, targetRole, isSelf);
      case "reset":
        return !isSelf && canResetUserPassword(role, targetRole);
      case "delete":
        return !isSelf && canDeleteUser(role, targetRole);
      default:
        return false;
    }
  };

  if (employees.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <p className="text-muted-foreground">No employees found</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody></TableBody>
      </Table>
    </div>
  );
}
