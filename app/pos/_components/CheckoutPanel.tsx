import { usePOSStore } from "@/store/posStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { PaymentMethod } from "../_types/pos.types";

interface CheckoutPanelProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (saleId: string) => void;
}

const CheckoutPanel = ({ open, onClose, onSuccess }: CheckoutPanelProps) => {
  const router = useRouter();
  const { user } = useAuthStore();
  const { cart, clearCart } = usePOSStore();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [isProcessing, setIsProcessing] = useState(false);
  return <div>CheckoutPanel</div>;
};

export default CheckoutPanel;
