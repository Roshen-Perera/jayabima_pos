import { usePermissions } from "@/hooks/usePermissions";
import { useEmployeeStore } from "@/store/employeeStore";
import { Employee } from "@/types/employee.type";

interface EditEmployeeModalProps {
  employee: Employee | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditEmployeeModal({
  employee,
  open,
  onOpenChange,
}: EditEmployeeModalProps) {
  const { updateEmployee, isSubmitting } = useEmployeeStore();
  const { isAdmin } = usePermissions();
}
