import { useEmployeeStore } from "@/store/employeeStore";


interface AddEmployeeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddEmployeeModal({
  open,
  onOpenChange,
}: AddEmployeeModalProps) {
  const { createEmployee, isSubmitting } = useEmployeeStore();


}