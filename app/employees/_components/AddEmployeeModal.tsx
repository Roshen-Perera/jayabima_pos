import { usePermissions } from "@/hooks/usePermissions";
import { UserRole } from "@/lib/rbac/permissions";
import { getAllowedRolesToCreate } from "@/lib/rbac/user-permissions";
import { useEmployeeStore } from "@/store/employeeStore";
import { useState } from "react";


interface AddEmployeeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddEmployeeModal({
  open,
  onOpenChange,
}: AddEmployeeModalProps) {
  const { createEmployee, isSubmitting } = useEmployeeStore();
  const { role } = usePermissions();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    name: "",
    phone: "",
    role: "" as UserRole | "",
  });
  
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const allowedRoles = role ? getAllowedRolesToCreate(role) : [];
}