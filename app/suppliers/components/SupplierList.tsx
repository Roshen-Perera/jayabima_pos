"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useSupplierStore } from "@/store/supplierStore";
import { Building2, CreditCard, FileText, Landmark, Loader2, Mail, MapPin, Phone } from "lucide-react";
import React, { useEffect } from "react";
import SupplierActions from "./SupplierActions";

const SupplierList = () => {
  const suppliers = useSupplierStore((s) => s.suppliers);
  const search = useSupplierStore((s) => s.search);
  const loading = useSupplierStore((s) => s.loading);
  const fetchSuppliers = useSupplierStore((s) => s.fetchSuppliers);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const filteredSuppliers = React.useMemo(() => {
    if (!search) return suppliers;
    const keyword = search.toLowerCase();
    return suppliers.filter(
      (s) =>
        s.name.toLowerCase().includes(keyword) ||
        (s.contactPerson && s.contactPerson.toLowerCase().includes(keyword)) ||
        (s.email && s.email.toLowerCase().includes(keyword)) ||
        (s.phone && s.phone.includes(keyword)) ||
        (s.address && s.address.toLowerCase().includes(keyword))
    );
  }, [suppliers, search]);

  if (loading && suppliers.length === 0) {
    return (
      <div className="flex justify-center items-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading suppliers...</span>
      </div>
    );
  }

  if (filteredSuppliers.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg bg-card">
        <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No suppliers found</h3>
        <p className="text-muted-foreground">
          {search
            ? "Try adjusting your search query"
            : "Add your first supplier to get started"}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
      {filteredSuppliers.map((supplier) => (
        <Card key={supplier.id} className="relative overflow-hidden hover:shadow-md transition-shadow">
          <CardContent className="px-5 pt-5 pb-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 pr-2">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-lg leading-snug">{supplier.name}</h3>
                  {!supplier.active && (
                    <Badge variant="secondary" className="bg-red-100 text-red-700">Inactive</Badge>
                  )}
                </div>
                {supplier.contactPerson && (
                  <p className="text-sm text-muted-foreground font-medium">
                    {supplier.contactPerson}
                  </p>
                )}
              </div>
              <SupplierActions supplier={supplier} />
            </div>

            <div className="space-y-2 text-sm border-t pt-3 mt-1">
              {supplier.email && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="w-4 h-4 text-primary shrink-0" />
                  <span className="truncate">{supplier.email}</span>
                </div>
              )}
              {supplier.phone && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="w-4 h-4 text-primary shrink-0" />
                  <span>{supplier.phone}</span>
                </div>
              )}
              {supplier.address && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4 text-primary shrink-0" />
                  <span className="truncate">{supplier.address}</span>
                </div>
              )}

              {(supplier.taxId || supplier.bankName) && (
                <div className="grid grid-cols-2 gap-2 pt-2 text-xs border-t text-muted-foreground">
                  {supplier.taxId && (
                    <div className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" />
                      <span className="truncate">Tax ID: {supplier.taxId}</span>
                    </div>
                  )}
                  {supplier.bankName && (
                    <div className="flex items-center gap-1.5">
                      <Landmark className="w-3.5 h-3.5" />
                      <span className="truncate">{supplier.bankName}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t mt-2">
                <span className="text-xs text-muted-foreground">Accounts Payable</span>
                <span className={`text-sm font-semibold ${Number(supplier.payableBalance) > 0 ? "text-amber-600 font-bold" : "text-emerald-600"}`}>
                  LKR {Number(supplier.payableBalance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SupplierList;
