import { Sale } from "@/app/pos/_types/pos.types";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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
            return <TableRow key={sale.id}>
                <TableRow key={sale.id}></TableRow>
            </TableRow>;
          })}
        </TableBody>
      </Table>
    </div>
  );
}
