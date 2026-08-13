"use client";

import { alert } from "@/lib/alert";
import { useSupplierStore } from "@/store/supplierStore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, FileCheck, Loader2, Package, Plus, Trash2, Truck } from "lucide-react";
import React, { useEffect, useState } from "react";
import { PurchaseOrder } from "../types/purchaseOrder.types";

export const PurchaseOrdersTab = () => {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [receivingId, setReceivingId] = useState<string | null>(null);

  const suppliers = useSupplierStore((s) => s.suppliers);
  const [products, setProducts] = useState<any[]>([]);

  // Form state
  const [selectedSupplierId, setSelectedSupplierId] = useState("");
  const [note, setNote] = useState("");
  const [expectedDate, setExpectedDate] = useState("");
  const [poItems, setPoItems] = useState<
    { productId: string; productName: string; quantity: number; cost: number }[]
  >([]);

  // Item input row state
  const [selectedProductId, setSelectedProductId] = useState("");
  const [itemQty, setItemQty] = useState(1);
  const [itemCost, setItemCost] = useState(0);

  const fetchPurchaseOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/purchase-orders");
      if (res.ok) {
        const data = await res.json();
        setPurchaseOrders(data);
      }
    } catch (err) {
      console.error("Error fetching POs:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/inventory");
      if (res.ok) {
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : data.products || []);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  useEffect(() => {
    fetchPurchaseOrders();
    fetchProducts();
  }, []);

  const handleProductSelect = (productId: string) => {
    setSelectedProductId(productId);
    const prod = products.find((p) => p.id === productId);
    if (prod) {
      setItemCost(Number(prod.cost) || 0);
    }
  };

  const addItemToPO = () => {
    if (!selectedProductId || itemQty <= 0 || itemCost < 0) {
      alert.error("Invalid item", "Please select a product and valid quantity/cost.");
      return;
    }
    const prod = products.find((p) => p.id === selectedProductId);
    if (!prod) return;

    setPoItems((prev) => [
      ...prev,
      {
        productId: prod.id,
        productName: prod.name,
        quantity: itemQty,
        cost: itemCost,
      },
    ]);

    setSelectedProductId("");
    setItemQty(1);
    setItemCost(0);
  };

  const removeItemFromPO = (index: number) => {
    setPoItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreatePO = async () => {
    if (!selectedSupplierId) {
      alert.error("Supplier required", "Please select a supplier for the order.");
      return;
    }
    if (poItems.length === 0) {
      alert.error("Items required", "Please add at least one product item.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/purchase-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supplierId: selectedSupplierId,
          note,
          expectedDate: expectedDate || undefined,
          items: poItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            cost: item.cost,
          })),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create Purchase Order");
      }

      alert.success("Purchase Order created!", "New order placed successfully.");
      setCreateOpen(false);
      setSelectedSupplierId("");
      setNote("");
      setExpectedDate("");
      setPoItems([]);
      fetchPurchaseOrders();
    } catch (err: any) {
      console.error(err);
      alert.error("Error creating PO", err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReceivePO = async (poId: string) => {
    setReceivingId(poId);
    try {
      const res = await fetch(`/api/purchase-orders/${poId}/receive`, {
        method: "POST",
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to receive Purchase Order");
      }

      alert.success(
        "Stock Received!",
        "Inventory stock levels and inventory logs have been updated automatically."
      );
      fetchPurchaseOrders();
      useSupplierStore.getState().fetchSuppliers();
    } catch (err: any) {
      console.error(err);
      alert.error("Receive Error", err.message);
    } finally {
      setReceivingId(null);
    }
  };

  const totalPOAmount = poItems.reduce((acc, i) => acc + i.quantity * i.cost, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Purchase Orders & Goods Inward</h2>
          <p className="text-sm text-muted-foreground">
            Manage product orders from suppliers and receive stock directly into inventory.
          </p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              New Purchase Order
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-160 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Purchase Order</DialogTitle>
              <DialogDescription>
                Order stock items from a supplier. Receiving the order will automatically update product stock levels.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-3">
              <div className="grid gap-2">
                <Label htmlFor="supplierSelect">Supplier *</Label>
                <select
                  id="supplierSelect"
                  className="w-full border rounded-md p-2 bg-background text-sm"
                  value={selectedSupplierId}
                  onChange={(e) => setSelectedSupplierId(e.target.value)}
                >
                  <option value="">-- Select Supplier --</option>
                  {suppliers
                    .filter((s) => s.active)
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} {s.contactPerson ? `(${s.contactPerson})` : ""}
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="expectedDate">Expected Delivery Date</Label>
                  <Input
                    id="expectedDate"
                    type="date"
                    value={expectedDate}
                    onChange={(e) => setExpectedDate(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="note">Notes / Reference</Label>
                  <Input
                    id="note"
                    placeholder="PO notes, delivery terms..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </div>
              </div>

              <div className="border rounded-md p-3 space-y-3 bg-muted/40">
                <Label className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Add Products to Order</Label>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end">
                  <div className="sm:col-span-6">
                    <Label className="text-xs">Product</Label>
                    <select
                      className="w-full border rounded-md p-2 text-sm bg-background"
                      value={selectedProductId}
                      onChange={(e) => handleProductSelect(e.target.value)}
                    >
                      <option value="">-- Select Product --</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} (Stock: {p.stock})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="text-xs">Qty</Label>
                    <Input
                      type="number"
                      min="1"
                      value={itemQty}
                      onChange={(e) => setItemQty(Number(e.target.value))}
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <Label className="text-xs">Cost (LKR)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={itemCost}
                      onChange={(e) => setItemCost(Number(e.target.value))}
                    />
                  </div>
                  <div className="sm:col-span-1">
                    <Button type="button" onClick={addItemToPO} className="w-full">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {poItems.length > 0 && (
                  <div className="border rounded-md overflow-hidden bg-card mt-3">
                    <table className="w-full text-sm">
                      <thead className="bg-muted text-xs font-medium border-b">
                        <tr>
                          <th className="p-2 text-left">Product</th>
                          <th className="p-2 text-center">Qty</th>
                          <th className="p-2 text-right">Cost</th>
                          <th className="p-2 text-right">Total</th>
                          <th className="p-2 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y text-xs">
                        {poItems.map((item, index) => (
                          <tr key={index}>
                            <td className="p-2 font-medium">{item.productName}</td>
                            <td className="p-2 text-center">{item.quantity}</td>
                            <td className="p-2 text-right">LKR {item.cost.toFixed(2)}</td>
                            <td className="p-2 text-right font-semibold">
                              LKR {(item.quantity * item.cost).toFixed(2)}
                            </td>
                            <td className="p-2 text-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeItemFromPO(index)}
                                className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="border-t font-semibold bg-muted/30">
                        <tr>
                          <td colSpan={3} className="p-2 text-right">Total Order Value:</td>
                          <td className="p-2 text-right text-primary text-sm font-bold">
                            LKR {totalPOAmount.toFixed(2)}
                          </td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreatePO} disabled={submitting}>
                {submitting ? "Submitting..." : "Issue Purchase Order"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading purchase orders...</span>
        </div>
      ) : purchaseOrders.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-card">
          <Truck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No purchase orders found</h3>
          <p className="text-muted-foreground">
            Create your first purchase order to start tracking supplier deliveries and stock intake.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {purchaseOrders.map((po) => (
            <Card key={po.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-base">{po.orderNumber}</span>
                      <Badge
                        variant={
                          po.status === "RECEIVED"
                            ? "default"
                            : po.status === "ORDERED"
                            ? "secondary"
                            : "outline"
                        }
                        className={
                          po.status === "RECEIVED"
                            ? "bg-emerald-600 hover:bg-emerald-700"
                            : "bg-blue-100 text-blue-800"
                        }
                      >
                        {po.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Supplier: <span className="font-semibold text-foreground">{po.supplierName || (po as any).supplier?.name}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Total Amount</p>
                      <p className="text-lg font-bold text-primary">
                        LKR {Number(po.totalAmount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </p>
                    </div>

                    {po.status === "ORDERED" && (
                      <Button
                        size="sm"
                        onClick={() => handleReceivePO(po.id)}
                        disabled={receivingId === po.id}
                        className="bg-emerald-600 hover:bg-emerald-700 gap-1.5"
                      >
                        {receivingId === po.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4" />
                        )}
                        Receive Goods
                      </Button>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Order Items</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {po.items?.map((item) => (
                      <div key={item.id} className="text-xs border p-2 rounded bg-muted/30 flex justify-between items-center">
                        <span className="font-medium truncate mr-2">{item.productName || (item as any).product?.name}</span>
                        <span className="font-semibold shrink-0">
                          {item.quantity} x LKR {Number(item.cost).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {po.note && (
                  <p className="text-xs text-muted-foreground mt-3 italic border-t pt-2">
                    Note: {po.note}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
