import { useEmployeeStore } from "@/store/employeeStore";
import React, { useState } from "react";

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

  return <div></div>;
};

export default Page;
