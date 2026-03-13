import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePermissions } from "@/hooks/usePermissions";
import { UserRole } from "@/lib/rbac/permissions";
import { getAllowedRolesToCreate } from "@/lib/rbac/user-permissions";
import { useEmployeeStore } from "@/store/employeeStore";
import { useState } from "react";
import TempPasswordDisplay from "./TempPasswordDisplay";
import { Button } from "@/components/ui/button";

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
      <DialogContent className="sm:max-w-125 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Employee</DialogTitle>
          <DialogDescription>
            Create a new employee account. Credentials will be sent via email.
          </DialogDescription>
        </DialogHeader>
        {tempPassword ? (
          // Show temp password after creation
          <div className="space-y-4">
            <TempPasswordDisplay
              password={tempPassword}
              username={formData.username}
              email={formData.email}
            />
            <Button onClick={handleClose} className="w-full">
              Done
            </Button>
          </div>
        ) : (
          <div></div>
        )}
        ;
      </DialogContent>
    </Dialog>
  );
}
