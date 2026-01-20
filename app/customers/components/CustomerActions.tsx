"use client";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCustomerStore } from "@/store/customerStore";

interface CustomerActionsProps {
  customerId: string;
  customerName: string;
}

const CustomerActions = ({
  customerId,
  customerName,
}: CustomerActionsProps) => {
  const deleteCustomer = useCustomerStore((s) => s.deleteCustomer);

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${customerName}?`)) {
      deleteCustomer(customerId);
    }
  };
  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" aria-label="Open menu" size="icon-sm">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-20" align="end">
          <DropdownMenuGroup>
            <DropdownMenuItem className="flex">
              <Pencil className="w-3 h-3 mr-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem className="flex text-destructive" onClick={handleDelete}>
              <Trash2 className="w-3 h-3 mr-4 text-destructive" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default CustomerActions;
