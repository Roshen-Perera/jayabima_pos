import { usePermissions } from "@/hooks/usePermissions";
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
  ) => {};
}
