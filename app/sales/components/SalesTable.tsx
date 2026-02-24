import { Sale } from "@/app/pos/_types/pos.types";
import { Table, TableHeader } from "@/components/ui/table";

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

  return <div className="border rounded-lg overflow-hidden">
    <Table>
        <TableHeader></TableHeader>
    </Table>
  </div>;
}
