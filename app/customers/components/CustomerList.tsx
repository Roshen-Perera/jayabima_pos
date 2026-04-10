import { Users, MoreVertical, Mail, MapPin } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCustomerStore } from "@/store/customerStore";
import CustomerActions from "./CustomerActions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const CustomerList = () => {
  const [tab, setTab] = useState("active");
  const customers = useCustomerStore((s) => s.customers);
  const inactiveCustomers = useCustomerStore((s) => s.inactiveCustomers);
  const search = useCustomerStore((s) => s.search);
  const loadCustomers = useCustomerStore((s) => s.loadCustomers);
  const loadInactiveCustomers = useCustomerStore(
    (s) => s.loadInactiveCustomers,
  );

  useEffect(() => {
    loadCustomers();
    loadInactiveCustomers();
  }, [loadCustomers, loadInactiveCustomers]);

  const filteredCustomers = React.useMemo(() => {
    const list = tab === "active" ? customers : inactiveCustomers;
    if (!search) return list;

    const keyword = search.toLowerCase();
    return list.filter(
      (c) =>
        c.name.toLowerCase().includes(keyword) ||
        c.email.toLowerCase().includes(keyword) ||
        c.address.toLowerCase().includes(keyword) ||
        c.phone.includes(keyword),
    );
  }, [customers, inactiveCustomers, search, tab]);
  return (
    <div>
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="active">Active Customers</TabsTrigger>
          <TabsTrigger value="inactive">Inactive Customers</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6">
          {filteredCustomers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No active customers found
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCustomers.map((customer) => (
                <Card key={customer.id}>
                  <CardContent>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">{customer.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {customer.phone || "No phone"}
                          </p>
                        </div>
                      </div>
                      <CustomerActions customer={customer} type="active" />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="w-4 h-4" />
                        {customer.email || "No email"}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        {customer.address || "No address"}
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border">
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Credit Balance
                          </p>
                          <p
                            className={`font-semibold ${
                              customer.creditBalance > 0
                                ? "text-destructive"
                                : "text-success"
                            }`}
                          >
                            Rs. {customer.creditBalance.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Loyalty Points
                          </p>
                          <p className="font-semibold text-primary">
                            {customer.loyaltyPoints.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-border">
                        <p className="text-xs text-muted-foreground">
                          Total Purchases
                        </p>
                        <p className="font-semibold">
                          Rs. {customer.totalPurchases.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="inactive" className="mt-6">
          {filteredCustomers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No inactive customers found
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCustomers.map((customer) => (
                <Card key={customer.id} className="opacity-60">
                  <CardContent>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center">
                          <Users className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-semibold">{customer.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {customer.phone || "No phone"}
                          </p>
                        </div>
                      </div>
                      <CustomerActions customer={customer} type="inactive" />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="w-4 h-4" />
                        {customer.email || "No email"}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        {customer.address || "No address"}
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border">
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Credit Balance
                          </p>
                          <p
                            className={`font-semibold ${
                              customer.creditBalance > 0
                                ? "text-destructive"
                                : "text-success"
                            }`}
                          >
                            Rs. {customer.creditBalance.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Loyalty Points
                          </p>
                          <p className="font-semibold text-primary">
                            {customer.loyaltyPoints.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-border">
                        <p className="text-xs text-muted-foreground">
                          Total Purchases
                        </p>
                        <p className="font-semibold">
                          Rs. {customer.totalPurchases.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomerList;
