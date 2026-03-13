import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEmployeeStore } from "@/store/employeeStore";
import { Employee } from "@/types/employee.type";
import { useState } from "react";
import TempPasswordDisplay from "./TempPasswordDisplay";

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

  if (!employee) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>Reset Password</DialogTitle>
          <DialogDescription>
            Reset password for {employee.name}
          </DialogDescription>
        </DialogHeader>
        {tempPassword ? (
          <div className="space-y-4">
            <TempPasswordDisplay
              password={tempPassword}
              username={employee.username}
              email={employee.email}
            />
          </div>
        ) : (
          <div className="space-y-4"></div>
        )}
      </DialogContent>
    </Dialog>
  );
}
