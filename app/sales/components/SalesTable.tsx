import { Sale } from "@/app/pos/_types/pos.types";

interface SalesTableProps {
  sales: Sale[];
  onViewReceipt: (sale: Sale) => void;
}

export default function SalesTable({ sales, onViewReceipt }: SalesTableProps) {
    
}