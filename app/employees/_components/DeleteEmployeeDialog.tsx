import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Employee } from "@/types/employee.type";
import { AlertTriangle } from "lucide-react";

interface DeleteEmployeeDialogProps {
  employee: Employee | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

export default function DeleteEmployeeDialog({
  employee,
  open,
  onOpenChange,
  onConfirm,
  isDeleting,
}: DeleteEmployeeDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <AlertDialogTitle>Deactivate Employee</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-2">
            <p>
              Are you sure you want to deactivate{" "}
              <strong>{employee ? employee.name : "Unknown"}</strong>
              {employee ? ` (${employee.email})` : ""}?
            </p>
            <p className="text-sm">This will:</p>
            <ul className="text-sm list-disc list-inside space-y-1 ml-2">
              <li>Set their account status to inactive</li>
              <li>Prevent them from logging in</li>
              <li>Preserve their data for audit trails</li>
            </ul>
            <p className="text-sm font-medium mt-2">
              You can reactivate this account later if needed.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
      </AlertDialogContent>
    </AlertDialog>
  );
}
