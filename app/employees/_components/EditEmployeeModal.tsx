import { usePermissions } from "@/hooks/usePermissions";
import { UserRole } from "@/lib/rbac/permissions";
import { useEmployeeStore } from "@/store/employeeStore";
import { Employee } from "@/types/employee.type";
import { useEffect, useState } from "react";

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

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "" as UserRole | "",
    isActive: true,
  });


}
