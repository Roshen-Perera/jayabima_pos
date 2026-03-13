import { useEmployeeStore } from "@/store/employeeStore";
import { Employee } from "@/types/employee.type";
import { useState } from "react";

interface ResetPasswordModalProps {
  employee: Employee | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ResetPasswordModal({
  employee,
  open,
  onOpenChange,
}: ResetPasswordModalProps) {
  const { resetEmployeePassword, isSubmitting } = useEmployeeStore();
  const [tempPassword, setTempPassword] = useState<string | null>(null);
}
