import { useSupplierStore } from "@/store/supplierStore";
import { Building2 } from "lucide-react";
import React from "react";

const SupplierList = () => {
  const suppliers = useSupplierStore((s) => s.suppliers);
  const search = useSupplierStore((s) => s.search);

  const filteredSuppliers = React.useMemo(() => {
    if (!search) return suppliers;
    const keyword = search.toLowerCase();
    return suppliers.filter(
      (s) =>
        s.name.toLowerCase().includes(keyword) ||
        s.contactPerson.toLowerCase().includes(keyword) ||
        s.email.toLowerCase().includes(keyword) ||
        s.phone.includes(keyword) ||
        s.address.toLowerCase().includes(keyword),
    );
  }, [suppliers, search]);

  if (filteredSuppliers.length === 0) {
    return (
      <div className="text-center py-12">
        <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No suppliers found</h3>
        <p className="text-muted-foreground">
          {search
            ? "Try adjusting your search"
            : "Add your first supplier to get started"}
        </p>
      </div>
    );
  }

  return <div>SupplierList</div>;
};

export default SupplierList;
