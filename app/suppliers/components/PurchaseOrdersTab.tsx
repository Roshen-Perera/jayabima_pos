"use client";

import { alert } from "@/lib/alert";
import { useSupplierStore } from "@/store/supplierStore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { CheckCircle2, Loader2, PackagePlus, Plus, Trash2, Truck } from "lucide-react";
import React, { useEffect, useState } from "react";
import { PurchaseOrder } from "../types/purchaseOrder.types";
import { productCategories } from "@/data/data";

interface PoItem {
  productId: string;
  productName: string;
  quantity: number;
  cost: number;
}

interface NewProductForm {
  name: string;
  sku: string;
  category: string;
  price: number;
}

const NEW_PRODUCT_SENTINEL = "__NEW__";

export const PurchaseOrdersTab = () => {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [receivingId, setReceivingId] = useState<string | null>(null);

  const suppliers = useSupplierStore((s) => s.suppliers);
  const [products, setProducts] = useState<any[]>([]);

  const [selectedSupplierId, setSelectedSupplierId] = useState("");
  const [note, setNote] = useState("");
  const [expectedDate, setExpectedDate] = useState("");
  const [poItems, setPoItems] = useState<PoItem[]>([]);

  const [selectedProductId, setSelectedProductId] = useState("");
  const [itemQty, setItemQty] = useState(1);
  const [itemCost, setItemCost] = useState(0);

  const [showNewProductForm, setShowNewProductForm] = useState(false);
  const [creatingProduct, setCreatingProduct] = useState(false);
  const [newProduct, setNewProduct] = useState<NewProductForm>({
    name: "",
    sku: "",
    category: "",
    price: 0,
  });

  const fetchPurchaseOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/purchase-orders");
      if (res.ok) setPurchaseOrders(await res.json());
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
    if (productId === NEW_PRODUCT_SENTINEL) {
      setSelectedProductId(NEW_PRODUCT_SENTINEL);
      setShowNewProductForm(true);
      return;
    }
    setSelectedProductId(productId);
    setShowNewProductForm(false);
    const prod = products.find((p) => p.id === productId);
    if (prod) setItemCost(Number(prod.cost) || 0);
  };

  const addItemToPO = () => {
    if (!selectedProductId || selectedProductId === NEW_PRODUCT_SENTINEL || itemQty <= 0 || itemCost < 0) {
      alert.error("Invalid item", "Please select a product and enter a valid quantity/cost.");
      return;
    }
    const prod = products.find((p) => p.id === selectedProductId);
    if (!prod) return;

    setPoItems((prev) => [
      ...prev,
      { productId: prod.id, productName: prod.name, quantity: itemQty, cost: itemCost },
    ]);

    setSelectedProductId("");
    setItemQty(1);
    setItemCost(0);
    setShowNewProductForm(false);
  };

  const removeItemFromPO = (index: number) =>
    setPoItems((prev) => prev.filter((_, i) => i !== index));

  const handleCreateAndAddProduct = async () => {
    if (!newProduct.name.trim() || !newProduct.sku.trim() || !newProduct.category) {
      alert.error("Missing fields", "Please fill in product name, SKU, and category.");
      return;
    }
    if (itemCost < 0) {
      alert.error("Invalid cost", "Please enter a valid cost price.");
      return;
    }

    setCreatingProduct(true);
    try {
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newProduct.name.trim(),
          sku: newProduct.sku.trim(),
          category: newProduct.category,
          price: newProduct.price || itemCost,
          cost: itemCost,
          stock: 0,
          minStock: 0,
          active: true,
          supplierId: selectedSupplierId || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create product");
      }

      const created = await res.json();
      await fetchProducts();

      setPoItems((prev) => [
        ...prev,
        {
          productId: created.id,
          productName: created.name,
          quantity: itemQty,
          cost: itemCost,
        },
      ]);

      alert.success("Product created!", `"${created.name}" was added to the catalog and to this order.`);

      setNewProduct({ name: "", sku: "", category: "", price: 0 });
      setSelectedProductId("");
      setItemQty(1);
      setItemCost(0);
      setShowNewProductForm(false);
    } catch (err: any) {
      console.error(err);
      alert.error("Create failed", err.message);
    } finally {
      setCreatingProduct(false);
    }
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
      setShowNewProductForm(false);
      setNewProduct({ name: "", sku: "", category: "", price: 0 });
      fetchPurchaseOrders();
    } catch (err: any) {
      console.error(err);
      alert.error("Error creating PO", err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Receive PO Modal State
  const [receiveModalOpen, setReceiveModalOpen] = useState(false);
  const [targetPo, setTargetPo] = useState<PurchaseOrder | null>(null);
  const [paymentTerm, setPaymentTerm] = useState<"CREDIT" | "CASH" | "CHEQUE" | "BANK_TRANSFER" | "PARTIAL" | "SPLIT">("CREDIT");
  const [paidAmount, setPaidAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "BANK_TRANSFER" | "CHEQUE">("CASH");
  const [reference, setReference] = useState("");
  const [chequeDate, setChequeDate] = useState("");

  // Split payment rows state (e.g. Cash + Cheque 1 + Cheque 2)
  const [splitRows, setSplitRows] = useState<
    { method: "CASH" | "BANK_TRANSFER" | "CHEQUE"; amount: number | ""; reference: string; chequeDate: string }[]
  >([]);

  const addSplitRow = (defaultMethod: "CASH" | "BANK_TRANSFER" | "CHEQUE" = "CHEQUE") => {
    setSplitRows((prev) => [...prev, { method: defaultMethod, amount: "", reference: "", chequeDate: "" }]);
  };

  const removeSplitRow = (index: number) => {
    setSplitRows((prev) => prev.filter((_, i) => i !== index));
  };

  const updateSplitRow = (index: number, field: string, value: any) => {
    setSplitRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  };

  const openReceiveModal = (po: PurchaseOrder) => {
    setTargetPo(po);
    setPaymentTerm("CREDIT");
    setPaidAmount(Number(po.totalAmount).toString());
    setPaymentMethod("CASH");
    setReference("");
    setChequeDate("");
    setSplitRows([
      { method: "CASH", amount: "", reference: "", chequeDate: "" },
      { method: "CHEQUE", amount: "", reference: "", chequeDate: "" },
    ]);
    setReceiveModalOpen(true);
  };

  const handleReceivePO = async () => {
    if (!targetPo) return;
    setReceivingId(targetPo.id);
    try {
      let bodyData: any = {};
      if (paymentTerm === "SPLIT") {
        const formattedPayments = splitRows
          .filter((r) => Number(r.amount) > 0)
          .map((r) => ({
            method: r.method,
            amount: Number(r.amount),
            reference: r.reference.trim() || undefined,
            chequeDate: r.chequeDate || undefined,
          }));

        if (formattedPayments.length === 0) {
          alert.error("Payments required", "Please enter an amount for at least one split payment row.");
          setReceivingId(null);
          return;
        }

        bodyData = {
          paymentTerm: "SPLIT",
          payments: formattedPayments,
        };
      } else {
        bodyData = {
          paymentTerm,
          paidAmount: paymentTerm === "PARTIAL" ? parseFloat(paidAmount) || 0 : undefined,
          paymentMethod,
          reference: reference.trim() || undefined,
          chequeDate: chequeDate || undefined,
        };
      }

      const res = await fetch(`/api/purchase-orders/${targetPo.id}/receive`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to receive Purchase Order");
      }

      alert.success(
        "Stock Received!",
        paymentTerm === "CREDIT"
          ? "Stock updated and full order amount added to supplier credit balance."
          : "Stock updated and all payment settlements recorded automatically."
      );
      setReceiveModalOpen(false);
      setTargetPo(null);
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
        <Dialog
          open={createOpen}
          onOpenChange={(open) => {
            setCreateOpen(open);
            if (!open) {
              setSelectedSupplierId("");
              setNote("");
              setExpectedDate("");
              setPoItems([]);
              setSelectedProductId("");
              setItemQty(1);
              setItemCost(0);
              setShowNewProductForm(false);
              setNewProduct({ name: "", sku: "", category: "", price: 0 });
            }
          }}
        >
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
                Order stock from a supplier. You can also create new products inline — they'll be
                added to the catalog with 0 stock and populated when you receive this order.
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
                  <div className="sm:col-span-5">
                    <Label className="text-xs">Product</Label>
                    <select
                      className="w-full border rounded-md p-2 text-sm bg-background"
                      value={selectedProductId}
                      onChange={(e) => handleProductSelect(e.target.value)}
                    >
                      <option value="">-- Select Product --</option>
                      <option value={NEW_PRODUCT_SENTINEL}>✦ Create New Product...</option>
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
                  <div className="sm:col-span-2">
                    {!showNewProductForm && (
                      <Button type="button" onClick={addItemToPO} className="w-full">
                        <Plus className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {showNewProductForm && (
                  <div className="border border-blue-200 dark:border-blue-800 rounded-md p-3 bg-blue-50/60 dark:bg-blue-950/30 space-y-3">
                    <div className="flex items-center gap-2 mb-1">
                      <PackagePlus className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm font-semibold text-blue-800 dark:text-blue-300">
                        New Product Details
                      </span>
                      <span className="text-xs text-blue-500 dark:text-blue-400">
                        — will be saved to the product catalog with 0 stock
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="grid gap-1">
                        <Label className="text-xs">Product Name *</Label>
                        <Input
                          placeholder="e.g. Cement 50kg"
                          value={newProduct.name}
                          onChange={(e) => setNewProduct((p) => ({ ...p, name: e.target.value }))}
                        />
                      </div>
                      <div className="grid gap-1">
                        <Label className="text-xs">SKU *</Label>
                        <Input
                          placeholder="e.g. CEM-50KG"
                          value={newProduct.sku}
                          onChange={(e) => setNewProduct((p) => ({ ...p, sku: e.target.value }))}
                        />
                      </div>
                      <div className="grid gap-1">
                        <Label className="text-xs">Category *</Label>
                        <select
                          className="w-full border rounded-md p-2 text-sm bg-background"
                          value={newProduct.category}
                          onChange={(e) => setNewProduct((p) => ({ ...p, category: e.target.value }))}
                        >
                          <option value="">-- Select Category --</option>
                          {productCategories.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="grid gap-1">
                        <Label className="text-xs">Selling Price (LKR) *</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="e.g. 2500"
                          value={newProduct.price || ""}
                          onChange={(e) => setNewProduct((p) => ({ ...p, price: Number(e.target.value) }))}
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <Button
                        type="button"
                        onClick={handleCreateAndAddProduct}
                        disabled={creatingProduct}
                        size="sm"
                        className="gap-1.5"
                      >
                        {creatingProduct ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <PackagePlus className="w-3.5 h-3.5" />
                        )}
                        {creatingProduct ? "Creating..." : "Create & Add to Order"}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setShowNewProductForm(false);
                          setSelectedProductId("");
                          setNewProduct({ name: "", sku: "", category: "", price: 0 });
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {poItems.length > 0 && (
                  <div className="border rounded-md overflow-hidden bg-card mt-3">
                    <table className="w-full text-sm">
                      <thead className="bg-muted text-xs font-medium border-b">
                        <tr>
                          <th className="p-2 text-left">Product</th>
                          <th className="p-2 text-center">Qty</th>
                          <th className="p-2 text-right">Cost</th>
                          <th className="p-2 text-right">Total</th>
                          <th className="p-2 text-center">Remove</th>
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
                          <td />
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
                        onClick={() => openReceiveModal(po)}
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

      {/* ── Receive Goods Payment Settlement Dialog ───────────────── */}
      <Dialog open={receiveModalOpen} onOpenChange={setReceiveModalOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Receive Goods &amp; Settle Order</DialogTitle>
            <DialogDescription>
              Confirming stock intake for order <span className="font-bold text-foreground">{targetPo?.orderNumber}</span>.
              Choose how this purchase is being settled.
            </DialogDescription>
          </DialogHeader>

          {targetPo && (
            <div className="space-y-4 py-3">
              <div className="p-3 bg-muted rounded-lg flex justify-between items-center text-sm">
                <span className="text-muted-foreground font-medium">Total Order Amount:</span>
                <span className="font-bold text-lg text-primary">
                  LKR {Number(targetPo.totalAmount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="receivePaymentTerm">Payment Settlement *</Label>
                <select
                  id="receivePaymentTerm"
                  className="w-full border rounded-md p-2 text-sm bg-background"
                  value={paymentTerm}
                  onChange={(e) => setPaymentTerm(e.target.value as any)}
                >
                  <option value="CREDIT">🔴 Credit (Pay Later — adds full amount to supplier balance)</option>
                  <option value="CASH">🟢 Cash (Paid immediately on delivery)</option>
                  <option value="CHEQUE">🟣 Cheque (Post-dated or immediate cheque)</option>
                  <option value="BANK_TRANSFER">🔵 Bank Transfer (Direct transfer)</option>
                  <option value="PARTIAL">🟡 Single Partial Payment (Part upfront, part credit)</option>
                  <option value="SPLIT">⚡ Split / Multi-Payment (Cash + Multiple Cheques + Credit)</option>
                </select>
              </div>

              {/* Split Multi-Payment Builder */}
              {paymentTerm === "SPLIT" && (
                <div className="space-y-3 p-3 border rounded-md bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-blue-900 dark:text-blue-200">
                      Payment Breakdown Rows
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addSplitRow("CHEQUE")}
                      className="h-7 text-xs gap-1"
                    >
                      <Plus className="w-3 h-3" /> Add Cheque / Line
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {splitRows.map((row, idx) => (
                      <div key={idx} className="p-2 border rounded bg-card text-xs space-y-2">
                        <div className="flex items-center gap-2">
                          <select
                            className="border rounded p-1 text-xs bg-background shrink-0"
                            value={row.method}
                            onChange={(e) => updateSplitRow(idx, "method", e.target.value)}
                          >
                            <option value="CASH">Cash</option>
                            <option value="CHEQUE">Cheque</option>
                            <option value="BANK_TRANSFER">Bank Transfer</option>
                          </select>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="Amount (LKR)"
                            className="h-7 text-xs flex-1"
                            value={row.amount}
                            onChange={(e) => updateSplitRow(idx, "amount", e.target.value)}
                          />
                          {splitRows.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeSplitRow(idx)}
                              className="h-7 w-7 p-0 text-red-500 hover:text-red-700 shrink-0"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>

                        {row.method === "CHEQUE" && (
                          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-dashed">
                            <Input
                              placeholder="Cheque No. (e.g. CHQ-001)"
                              className="h-7 text-xs"
                              value={row.reference}
                              onChange={(e) => updateSplitRow(idx, "reference", e.target.value)}
                            />
                            <Input
                              type="date"
                              className="h-7 text-xs"
                              value={row.chequeDate}
                              onChange={(e) => updateSplitRow(idx, "chequeDate", e.target.value)}
                            />
                          </div>
                        )}

                        {row.method === "BANK_TRANSFER" && (
                          <Input
                            placeholder="Bank Ref / Txn ID"
                            className="h-7 text-xs"
                            value={row.reference}
                            onChange={(e) => updateSplitRow(idx, "reference", e.target.value)}
                          />
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t text-xs space-y-1">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Total Payments Added:</span>
                      <span className="font-semibold text-foreground">
                        LKR{" "}
                        {splitRows
                          .reduce((sum, r) => sum + (Number(r.amount) || 0), 0)
                          .toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Remaining Unpaid (Added to Credit):</span>
                      <span className="font-bold text-blue-600 dark:text-blue-400">
                        LKR{" "}
                        {Math.max(
                          0,
                          Number(targetPo.totalAmount) -
                            splitRows.reduce((sum, r) => sum + (Number(r.amount) || 0), 0)
                        ).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Partial payment details */}
              {paymentTerm === "PARTIAL" && (
                <div className="grid gap-3 p-3 border rounded-md bg-yellow-50/50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800">
                  <div className="grid gap-1">
                    <Label className="text-xs font-semibold">Upfront Amount Paid (LKR) *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="e.g. 20000"
                      value={paidAmount}
                      onChange={(e) => setPaidAmount(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-1">
                    <Label className="text-xs font-semibold">Payment Method *</Label>
                    <select
                      className="w-full border rounded-md p-2 text-sm bg-background"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                    >
                      <option value="CASH">Cash</option>
                      <option value="BANK_TRANSFER">Bank Transfer</option>
                      <option value="CHEQUE">Cheque</option>
                    </select>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Remaining balance:{" "}
                    <span className="font-bold text-foreground">
                      LKR {Math.max(0, Number(targetPo.totalAmount) - (parseFloat(paidAmount) || 0)).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </span>{" "}
                    will be added to supplier credit.
                  </p>
                </div>
              )}

              {/* Cheque / Reference fields */}
              {(paymentTerm === "CHEQUE" || (paymentTerm === "PARTIAL" && paymentMethod === "CHEQUE")) && (
                <div className="grid gap-3 p-3 border rounded-md bg-purple-50/50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800">
                  <div className="grid gap-1">
                    <Label className="text-xs font-semibold">Cheque Number *</Label>
                    <Input
                      placeholder="e.g. CHQ-889900"
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-1">
                    <Label className="text-xs font-semibold">Cheque Date / Realization Date</Label>
                    <Input
                      type="date"
                      value={chequeDate}
                      onChange={(e) => setChequeDate(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {(paymentTerm === "BANK_TRANSFER" || (paymentTerm === "PARTIAL" && paymentMethod === "BANK_TRANSFER")) && (
                <div className="grid gap-1">
                  <Label className="text-xs font-semibold">Bank Transfer Reference / Txn ID</Label>
                  <Input
                    placeholder="e.g. TRX-991200"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setReceiveModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleReceivePO}
              disabled={receivingId !== null}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {receivingId ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <CheckCircle2 className="w-4 h-4 mr-2" />
              )}
              Confirm &amp; Receive Goods
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

