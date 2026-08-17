"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Printer, Receipt } from "lucide-react";
import { CustomerPayment } from "../types/customerPayment.types";
import { Customer } from "../types/customer.types";

interface CustomerPaymentReceiptModalProps {
  open: boolean;
  onClose: () => void;
  payment:
    | (CustomerPayment & {
        customer?: { id?: string; name?: string | null; creditBalance?: number; phone?: string | null } | null;
      })
    | null;
  customer?: Customer | null;
}

export default function CustomerPaymentReceiptModal({
  open,
  onClose,
  payment,
  customer,
}: CustomerPaymentReceiptModalProps) {
  if (!payment) return null;

  const handlePrint = () => window.print();

  const customerName =
    payment.customerName || customer?.name || payment.customer?.name || "Customer";
  const customerPhone = customer?.phone || payment.customer?.phone || "";
  // Prefer payment.customer.creditBalance (returned directly from the API after the
  // balance decrement) over the customer prop, which may still hold the stale
  // pre-payment balance from local React state at the time the modal opens.
  const remainingBalance = Number(
    payment.customer?.creditBalance ?? customer?.creditBalance ?? 0
  );
  const amountPaid = Number(payment.amount || 0);
  const previousBalance = remainingBalance + amountPaid;

  const receiptDate = payment.paidAt
    ? new Date(payment.paidAt).toLocaleString("en-LK")
    : new Date(payment.createdAt || Date.now()).toLocaleString("en-LK");

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-sm max-h-[90vh] flex flex-col print:max-h-none"
        data-theme="light"
      >
        <DialogHeader className="print:hidden">
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-emerald-600" />
            Payment Received Receipt
          </DialogTitle>
        </DialogHeader>

        {/* Receipt content */}
        <div
          className="space-y-3 font-mono text-sm overflow-y-auto flex-1 pr-1 print:overflow-visible print:flex-none"
          id="payment-receipt-content"
        >
          {/* Header */}
          <div className="text-center space-y-0.5">
            <div className="flex justify-center items-center">
              <img src="/dwd.png" alt="Store Logo" width={200} height={100} />
            </div>
            <p className="text-xs text-muted-foreground">
              No 28/D, Rathnapura Road, Diurumpitiya, Getaheththa
            </p>
            <p className="text-xs text-muted-foreground">
              0777187729 / 0362231535
            </p>
            <p className="text-xs font-bold text-foreground mt-1 uppercase tracking-wider">
              OFFICIAL PAYMENT RECEIPT
            </p>
            <p className="text-xs text-muted-foreground">{receiptDate}</p>
            <p className="text-xs text-muted-foreground">
              Receipt #PAY-{payment.id.slice(-8).toUpperCase()}
            </p>
          </div>

          <hr />

          {/* Customer Details */}
          <div className="space-y-0.5 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Customer:</span>
              <span className="font-semibold">{customerName}</span>
            </div>
            {customerPhone && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phone:</span>
                <span>{customerPhone}</span>
              </div>
            )}
          </div>

          <hr />

          {/* Payment Method Details */}
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment Method:</span>
              <span className="font-semibold">{payment.method}</span>
            </div>
            {payment.reference && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {payment.method === "CHEQUE"
                    ? "Cheque No:"
                    : "Reference / Txn ID:"}
                </span>
                <span className="font-medium">{payment.reference}</span>
              </div>
            )}
            {payment.chequeDate && payment.method === "CHEQUE" && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cheque Date:</span>
                <span>
                  {new Date(payment.chequeDate).toLocaleDateString("en-LK")}
                </span>
              </div>
            )}
            {payment.note && (
              <div className="text-[11px] text-muted-foreground italic pt-0.5">
                Note: {payment.note}
              </div>
            )}
          </div>

          <hr />

          {/* Account Statement */}
          <div className="border border-dashed p-2 rounded space-y-1 text-xs bg-muted/20">
            <p className="font-bold text-center text-foreground text-[11px] uppercase tracking-wide mb-1">
              Account Statement
            </p>
            <div className="flex justify-between text-muted-foreground">
              <span>{previousBalance > 0 ? "Previous Debt Owed:" : previousBalance < 0 ? "Previous Store Deposit:" : "Previous Balance:"}</span>
              <span>
                Rs.{" "}
                {Math.abs(previousBalance).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-medium">
              <span>- Payment Received:</span>
              <span>
                Rs.{" "}
                {amountPaid.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="flex justify-between font-bold text-foreground border-t border-dashed pt-1 mt-1">
              <span>{remainingBalance > 0 ? "Remaining Debt Owed:" : remainingBalance < 0 ? "Advance Store Deposit:" : "Account Settled:"}</span>
              <span
                className={
                  remainingBalance > 0 ? "text-destructive" : remainingBalance < 0 ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
                }
              >
                Rs.{" "}
                {Math.abs(remainingBalance).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-2">
            Thank you for your payment!
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-2 print:hidden">
          <Button variant="outline" className="flex-1" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print Receipt
          </Button>
          <Button className="flex-1" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
