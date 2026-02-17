import { alert } from "@/lib/alert";
import React from "react";

interface ReceiptModalProps {
  open: boolean;
  onClose: () => void;
  sale: {
    id: string;
    items: Array<{
      name: string;
      quantity: number;
      price: number;
    }>;
    subtotal: number;
    discount: number;
    total: number;
    paymentMethod: string;
    createdAt: string;
  } | null;
}

const ReceiptModal = ({ open, onClose, sale }: ReceiptModalProps) => {
  if (!sale) return null;
  const handlePrint = () => {
    window.print();
  };
  const handleDownload = () => {
    // TODO: Generate PDF receipt
    alert.success("PDF download coming soon!");
  };
  return <div>ReceiptModal</div>;
};

export default ReceiptModal;
