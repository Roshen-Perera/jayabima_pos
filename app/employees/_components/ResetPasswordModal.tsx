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

  const handleReset = async () => {
    if (!employee) return;

    const result = await resetEmployeePassword(employee.id);

    if (result.success) {
      setTempPassword(result.temporaryPassword || null);
    }
  };

  const handleClose = () => {
    setTempPassword(null);
    onOpenChange(false);
  };
}
