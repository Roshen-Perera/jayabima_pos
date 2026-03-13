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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

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
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">
                Username <span className="text-destructive">*</span>
              </Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                placeholder="john.doe"
                required
                minLength={3}
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="john@jayabima.com"
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">
                Full Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="John Doe"
                required
                minLength={2}
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="0771234567 (optional)"
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">
                Role <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.role}
                onValueChange={(value) =>
                  setFormData({ ...formData, role: value as UserRole })
                }
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {allowedRoles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                You can create: {allowedRoles.join(", ")}
              </p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md p-3">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                <strong>ℹ️ Note:</strong> A temporary password will be
                automatically generated and sent to the employee&apos;s email.
                They will be required to change it on first login.
              </p>
            </div>
            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Employee"
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
