import { Users, MoreVertical, Mail, MapPin } from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCustomerStore } from "@/store/customerStore";

const CustomerList = () => {
    const customers = useCustomerStore((s) => s.customers);
    const search = useCustomerStore((s) => s.search);

    const filteredCustomers = React.useMemo(() => {
      if (!search) return customers;

      const keyword = search.toLowerCase();
      return customers.filter(
        (c) =>
          c.name.toLowerCase().includes(keyword) ||
          c.email.toLowerCase().includes(keyword) ||
          c.address.toLowerCase().includes(keyword) ||
          c.phone.includes(keyword)
      );
    }, [customers, search]);
  return (
    <div>
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
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{customer.name}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {customer.phone}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="w-8 h-8">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  {customer.email}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  {customer.address}
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
    </div>
  );
};

export default CustomerList;
