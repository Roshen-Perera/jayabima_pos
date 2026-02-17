import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import React from "react";

interface CheckoutPanelProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (saleId: string) => void;
}

const CheckoutPanel = ({ open, onClose, onSuccess }: CheckoutPanelProps) => {
  const router = useRouter();
  const { user } = useAuthStore();
  return <div>CheckoutPanel</div>;
};

export default CheckoutPanel;
