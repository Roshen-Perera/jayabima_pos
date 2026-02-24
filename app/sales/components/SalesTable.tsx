import { Sale } from "@/app/pos/_types/pos.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Printer, User } from "lucide-react";

interface SalesTableProps {
  sales: Sale[];
  onViewReceipt: (sale: Sale) => void;
}

export default function SalesTable({ sales, onViewReceipt }: SalesTableProps) {
  if (sales.length === 0) {
    return (
      <div className="border rounded-lg p-12 text-center">
        <p className="text-muted-foreground">No sales found</p>
        <p className="text-sm text-muted-foreground mt-1">
          Sales will appear here after checkout
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Receipt #</TableHead>
            <TableHead>Date & Time</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Items</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sales.map((sale) => {
            const totalQuantity = sale.items.reduce(
              (sum, item) => sum + item.quantity,
              0,
            );
            return (
              <TableRow key={sale.id}>
                <TableCell className="font-mono text-sm">
                  #{sale.id.slice(-8).toUpperCase()}
                </TableCell>
                <TableCell className="text-sm">
                  <div>
                    {new Date(sale.createdAt).toLocaleDateString("en-LK")}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(sale.createdAt).toLocaleTimeString("en-LK", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </TableCell>
                <TableCell>
                  {sale.customerName &&
                  sale.customerName !== "Walking Customer" ? (
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{sale.customerName}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      Walk-in
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {sale.items.length} item{sale.items.length !== 1 ? "s" : ""}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {totalQuantity} qty
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{sale.paymentMethod}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="font-semibold">
                    Rs. {sale.total.toLocaleString()}
                  </div>
                  {sale.totalSavings && sale.totalSavings > 0 && (
                    <div className="text-xs text-green-600">
                      Saved Rs. {sale.totalSavings.toLocaleString()}
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewReceipt(sale)}
                  >
                    <Printer className="h-4 w-4 mr-1" />
                    Reprint
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
