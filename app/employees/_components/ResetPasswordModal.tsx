import { Employee } from "@/types/employee.type";


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
    
}