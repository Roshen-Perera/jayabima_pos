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
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

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
            <Button onClick={handleClose} className="w-full">
              Done
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-md p-4">
              <div className="flex gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                    Are you sure you want to reset this password?
                  </p>
                  <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1 list-disc list-inside">
                    <li>A new temporary password will be generated</li>
                    <li>
                      Credentials will be sent to{" "}
                      <strong>{employee.email}</strong>
                    </li>
                    <li>Employee must change password on next login</li>
                    <li>Current password will be immediately invalidated</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
