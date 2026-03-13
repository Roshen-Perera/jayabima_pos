import { AlertDialog, AlertDialogContent } from "@/components/ui/alert-dialog";
import { Employee } from "@/types/employee.type";

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
      <AlertDialogContent></AlertDialogContent>
    </AlertDialog>
  );
}
