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
    
}
