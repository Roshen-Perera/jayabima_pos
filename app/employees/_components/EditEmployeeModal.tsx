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

  const [formData, setFormData] = useState(() => ({
    name: employee?.name || "",
    email: employee?.email || "",
    phone: employee?.phone || "",
    role: employee?.role ?? ("" as UserRole | ""),
    isActive: employee?.isActive ?? true,
  }));

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen && employee) {
      // Reset form with fresh employee data when opening
      setFormData({
        name: employee.name,
        email: employee.email,
        phone: employee.phone || "",
        role: employee.role,
        isActive: employee.isActive,
      });
    }
    onOpenChange(isOpen);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee) return;
  };
}
