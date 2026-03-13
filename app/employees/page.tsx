import { useEmployeeStore } from '@/store/employeeStore';
import React from 'react'

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
  return (
    <div></div>
  )
}

export default Page