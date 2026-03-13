import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePermissions } from "@/hooks/usePermissions";
import { UserRole } from "@/lib/rbac/permissions";
import {
  canDeleteUser,
  canEditUser,
  canResetUserPassword,
} from "@/lib/rbac/user-permissions";
import { Employee } from "@/types/employee.type";
import { MoreHorizontal, Pencil, Key, Trash2 } from "lucide-react";
import { format } from "path";

interface EmployeeTableProps {
  employees: Employee[];
  onEdit: (employee: Employee) => void;
  onResetPassword: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
}

export default function EmployeeTable({
  employees,
  onEdit,
  onResetPassword,
  onDelete,
}: EmployeeTableProps) {
  const { role, user } = usePermissions();
  const getRoleBadgeVariant = (employeeRole: string) => {
    switch (employeeRole) {
      case "ADMIN":
        return "destructive";
      case "MANAGER":
        return "default";
      case "CASHIER":
        return "secondary";
      default:
        return "outline";
    }
  };

  const canPerformAction = (
    employee: Employee,
    action: "edit" | "reset" | "delete",
  ) => {
    if (!role || !user) return false;
    const isSelf = user.id === employee.id;
    const targetRole = employee.role as UserRole;
    switch (action) {
      case "edit":
        return canEditUser(role, targetRole, isSelf);
      case "reset":
        return !isSelf && canResetUserPassword(role, targetRole);
      case "delete":
        return !isSelf && canDeleteUser(role, targetRole);
      default:
        return false;
    }
  };

  if (employees.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <p className="text-muted-foreground">No employees found</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee) => {
            const showEdit = canPerformAction(employee, "edit");
            const showReset = canPerformAction(employee, "reset");
            const showDelete = canPerformAction(employee, "delete");
            const showActions = showEdit || showReset || showDelete;

            return (
              <TableRow key={employee.id}>
                {/* Name & Username */}
                <TableCell>
                  <div>
                    <p className="font-medium">{employee.name}</p>
                    <p className="text-sm text-muted-foreground">
                      @{employee.username}
                    </p>
                  </div>
                </TableCell>

                {/* Email */}
                <TableCell>{employee.email}</TableCell>

                {/* Role */}
                <TableCell>
                  <Badge variant={getRoleBadgeVariant(employee.role)}>
                    {employee.role}
                  </Badge>
                </TableCell>

                {/* Status */}
                <TableCell>
                  {employee.isActive ? (
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700 border-green-200"
                    >
                      Active
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="bg-gray-50 text-gray-700 border-gray-200"
                    >
                      Inactive
                    </Badge>
                  )}
                </TableCell>

                {/* Joined Date */}
                <TableCell className="text-sm text-muted-foreground">
                  {format(new Date(employee.createdAt), "MMM d, yyyy")}
                </TableCell>

                {/* Actions */}
                <TableCell className="text-right">
                  {showActions && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />

                        {showEdit && (
                          <DropdownMenuItem onClick={() => onEdit(employee)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                        )}

                        {showReset && (
                          <DropdownMenuItem
                            onClick={() => onResetPassword(employee)}
                          >
                            <Key className="h-4 w-4 mr-2" />
                            Reset Password
                          </DropdownMenuItem>
                        )}

                        {showDelete && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => onDelete(employee)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Deactivate
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
