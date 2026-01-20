"use client";
import { MoreHorizontalIcon, MoreVertical, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const CustomerActions = () => {
  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" aria-label="Open menu" size="icon-sm">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-40" align="end">
          <DropdownMenuLabel>File Actions</DropdownMenuLabel>
          <DropdownMenuGroup>
            <DropdownMenuItem>New File...</DropdownMenuItem>
            <DropdownMenuItem>Share...</DropdownMenuItem>
            <DropdownMenuItem disabled>Download</DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default CustomerActions;
