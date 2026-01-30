import { useSupplierStore } from "@/store/supplierStore";
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

  return <div>SupplierList</div>;
};

export default SupplierList;
