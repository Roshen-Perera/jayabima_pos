interface EmployeeFiltersProps {
  searchQuery: string;
  roleFilter: string;
  statusFilter: string;
  onSearchChange: (value: string) => void;
  onRoleChange: (value: string) => void;
  onStatusChange: (value: string) => void;
}

export default function EmployeeFilters({
  searchQuery,
  roleFilter,
  statusFilter,
  onSearchChange,
  onRoleChange,
  onStatusChange,
}: EmployeeFiltersProps) {
  return <div className="flex flex-col md:flex-row gap-4"></div>;
}
