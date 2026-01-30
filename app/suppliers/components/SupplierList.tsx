"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSupplierStore } from "@/store/supplierStore";
import { Building2, Mail, MapPin, MoreVertical, Phone } from "lucide-react";
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
      {filteredSuppliers.map((supplier) => (
        <Card key={supplier.id}>
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-lg">{supplier.name}</h3>
                  {!supplier.active && (
                    <Badge variant="secondary">Inactive</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {supplier.contactPerson}
                </p>
              </div>
              <Button variant="outline" aria-label="Open menu" size="icon-sm">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4" />
                {supplier.email}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4" />
                {supplier.phone}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                {supplier.address}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SupplierList;
