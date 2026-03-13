import { Employee } from "@/types/employee.type";

interface EditEmployeeModalProps {
  employee: Employee | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
