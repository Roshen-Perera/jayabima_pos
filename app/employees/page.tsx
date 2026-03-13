"use client"

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEmployeeStore } from "@/store/employeeStore";
import { Employee } from "@/types/employee.type";
import { UserPlus } from "lucide-react";
import React, { useEffect, useState } from "react";
import EmployeeFilters from "./_components/EmployeeFilters";
import EmployeeTable from "./_components/EmployeeTable";
import { Skeleton } from "@/components/ui/skeleton";
import AddEmployeeModal from "./_components/AddEmployeeModal";
import EditEmployeeModal from "./_components/EditEmployeeModal";
import ResetPasswordModal from "./_components/ResetPasswordModal";
import DeleteEmployeeDialog from "./_components/DeleteEmployeeDialog";

const Page = () => {
  const {
    employees,
    isLoading,
    searchQuery,
    roleFilter,
    statusFilter,
    fetchEmployees,
    setSearchQuery,
    setRoleFilter,
    setStatusFilter,
    deleteEmployee,
  } = useEmployeeStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null,
  );

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEmployees();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, fetchEmployees]);

  const handleEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowEditModal(true);
  };

  const handleResetPassword = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowResetModal(true);
  };

  const handleDelete = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedEmployee) return;

    const success = await deleteEmployee(selectedEmployee.id);
    if (success) {
      setShowDeleteDialog(false);
      setSelectedEmployee(null);
    }
  };

  return (
    <div className="container mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <p className="text-muted-foreground">
            Manage employee accounts and permissions
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Add Employee
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Search and filter employees</CardDescription>
        </CardHeader>
        <CardContent>
          <EmployeeFilters
            searchQuery={searchQuery}
            roleFilter={roleFilter}
            statusFilter={statusFilter}
            onSearchChange={setSearchQuery}
            onRoleChange={setRoleFilter}
            onStatusChange={setStatusFilter}
          />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Employees ({employees.length})</CardTitle>
          <CardDescription>All employees in the system</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            // Loading skeleton
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            // Employee table
            <EmployeeTable
              employees={employees}
              onEdit={handleEdit}
              onResetPassword={handleResetPassword}
              onDelete={handleDelete}
            />
          )}
        </CardContent>
      </Card>
      <AddEmployeeModal open={showAddModal} onOpenChange={setShowAddModal} />
      <EditEmployeeModal
        employee={selectedEmployee}
        open={showEditModal}
        onOpenChange={setShowEditModal}
      />
      <ResetPasswordModal
        employee={selectedEmployee}
        open={showResetModal}
        onOpenChange={setShowResetModal}
      />
      <DeleteEmployeeDialog
        employee={selectedEmployee}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleConfirmDelete}
        isDeleting={false}
      />
    </div>
  );
};

export default Page;
