import React from "react";

interface CheckoutPanelProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (saleId: string) => void;
}

const CheckoutPanel = () => {
  return <div>CheckoutPanel</div>;
};

export default CheckoutPanel;
