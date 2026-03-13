import { Dialog } from "@/components/ui/dialog";
import { usePermissions } from "@/hooks/usePermissions";
import { UserRole } from "@/lib/rbac/permissions";
import { getAllowedRolesToCreate } from "@/lib/rbac/user-permissions";
import { useEmployeeStore } from "@/store/employeeStore";
import { DialogContent } from "@radix-ui/react-dialog";
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.role) return;

    const result = await createEmployee({
      username: formData.username,
      email: formData.email,
      name: formData.name,
      phone: formData.phone || undefined,
      role: formData.role as UserRole,
    });

    if (result.success) {
      // Show temp password
      setTempPassword(result.temporaryPassword || null);
    }
  };

  const handleClose = () => {
    // Reset form
    setFormData({
      username: "",
      email: "",
      name: "",
      phone: "",
      role: "",
    });
    setTempPassword(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-125 max-h-[90vh] overflow-y-auto"></DialogContent>
    </Dialog>
  );
}
