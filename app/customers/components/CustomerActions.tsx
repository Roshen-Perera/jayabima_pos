"use client";

import { MoreVertical, Pencil, Trash2, RotateCcw, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCustomerStore } from "@/store/customerStore";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Customer } from "../types/customer.types";
import { CustomerForm } from "./CustomerForm";
import { alert } from "@/lib/alert";

interface CustomerActionsProps {
  customer: Customer;
  type?: "active" | "inactive";
}

const CustomerActions = ({
  customer,
  type = "active",
}: CustomerActionsProps) => {
  const deactivateCustomer = useCustomerStore((s) => s.deactivateCustomer);
  const reactivateCustomer = useCustomerStore((s) => s.reactivateCustomer);
  const [showActionAlert, setShowActionAlert] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleDownloadLedger = async () => {
    try {
      setDownloading(true);
      const [salesRes, paymentsRes] = await Promise.all([
        fetch(`/api/sales?customerId=${customer.id}`),
        fetch(`/api/customer-payments?customerId=${customer.id}`),
      ]);

      const sales = salesRes.ok ? await salesRes.json() : [];
      const payments = paymentsRes.ok ? await paymentsRes.json() : [];

      const entries: any[] = [];
      sales.forEach((s: any) => {
        entries.push({
          dateStr: new Date(s.createdAt || Date.now()).toLocaleDateString("en-LK"),
          ref: s.reference || `INV-${s.id.slice(-6).toUpperCase()}`,
          type: "INVOICE",
          description: `[Sales Invoice] POS Sale`,
          debit: Number(s.total || s.originalTotal || 0),
          credit: 0,
        });
      });
      payments.forEach((p: any) => {
        entries.push({
          dateStr: new Date(p.paidAt || p.createdAt || Date.now()).toLocaleDateString("en-LK"),
          ref: `PAY-${p.id.slice(-6).toUpperCase()}`,
          type: "PAYMENT",
          description: `Payment Received [${p.method || "CASH"}]${p.note ? ` - ${p.note}` : ""}`,
          debit: 0,
          credit: Number(p.amount || 0),
        });
      });
      entries.sort((a, b) => new Date(a.dateStr).getTime() - new Date(b.dateStr).getTime());

      let bal = 0;
      const finalEntries = entries.map((e) => {
        bal += e.debit - e.credit;
        return { ...e, runningBalance: bal };
      });

      const totalBilled = finalEntries.reduce((sum, e) => sum + e.debit, 0);
      const totalPaid = finalEntries.reduce((sum, e) => sum + e.credit, 0);
      const netOutstanding = Number(customer.creditBalance ?? (totalBilled - totalPaid));

      const res = await fetch(`/api/customers/${customer.id}/pdf-statement`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filteredEntries: finalEntries,
          totalBilled,
          totalPaid,
          netOutstanding,
        }),
      });

      if (!res.ok) throw new Error("Failed to download PDF ledger");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Statement_STMT-${customer.id.slice(-6).toUpperCase()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();

      alert.success("PDF Downloaded!", `Statement_STMT-${customer.id.slice(-6).toUpperCase()}.pdf saved to downloads.`);
    } catch (err: any) {
      alert.error("Download Failed", err.message || "Failed to download PDF ledger");
    } finally {
      setDownloading(false);
    }
  };

  const handleDeactivate = () => {
    deactivateCustomer(customer.id);
    alert.success(`Customer ${customer.name} has been deactivated.`);

    setShowActionAlert(false);
  };

  const handleReactivate = () => {
    reactivateCustomer(customer.id);
    alert.success(`Customer ${customer.name} has been reactivated.`);

    setShowActionAlert(false);
  };

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" aria-label="Open menu" size="icon-sm">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-44" align="end">
          <DropdownMenuGroup>
            <DropdownMenuItem
              className="flex items-center"
              onClick={handleDownloadLedger}
              disabled={downloading}
            >
              {downloading ? (
                <Loader2 className="w-3.5 h-3.5 mr-2.5 animate-spin text-primary" />
              ) : (
                <Download className="w-3.5 h-3.5 mr-2.5 text-primary" />
              )}
              Download PDF Ledger
            </DropdownMenuItem>

            <DropdownMenuItem
              className="flex items-center"
              onClick={() => setShowEditDialog(true)}
            >
              <Pencil className="w-3.5 h-3.5 mr-2.5" />
              Edit Customer
            </DropdownMenuItem>

            {type === "active" && (
              <DropdownMenuItem
                className="flex text-destructive"
                onClick={() => setShowActionAlert(true)}
              >
                <Trash2 className="w-3 h-3 mr-4 text-destructive" />
                Deactivate
              </DropdownMenuItem>
            )}

            {type === "inactive" && (
              <DropdownMenuItem
                className="flex"
                onClick={() => setShowActionAlert(true)}
              >
                <RotateCcw className="w-3 h-3 mr-4" />
                Reactivate
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <CustomerForm
        customer={customer}
        mode="edit"
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
      />

      <AlertDialog open={showActionAlert} onOpenChange={setShowActionAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {type === "active"
                ? `This will deactivate ${customer.name}. You can reactivate them later.`
                : `This will reactivate ${customer.name} and move them back to active customers.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={type === "active" ? handleDeactivate : handleReactivate}
              className={
                type === "active"
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : ""
              }
            >
              {type === "active"
                ? "Deactivate Customer"
                : "Reactivate Customer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default CustomerActions;
