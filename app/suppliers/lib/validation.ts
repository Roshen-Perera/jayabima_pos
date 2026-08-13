import { z } from "zod";

export const supplierSchema = z.object({
    name: z.string().min(2, "Supplier name must be at least 2 characters"),
    contactPerson: z.string().optional(),
    email: z.string().email("Invalid email address").optional().or(z.literal("")),
    phone: z.string().optional(),
    address: z.string().optional(),
    payableBalance: z.number().optional(),
    taxId: z.string().optional(),
    bankName: z.string().optional(),
    accountNumber: z.string().optional(),
    active: z.boolean()
});

export type SupplierFormData = z.infer<typeof supplierSchema>;

export const purchaseOrderItemSchema = z.object({
    productId: z.string().min(1, "Product is required"),
    quantity: z.number().min(1, "Quantity must be at least 1"),
    cost: z.number().min(0, "Cost cannot be negative"),
});

export const purchaseOrderSchema = z.object({
    supplierId: z.string().min(1, "Supplier is required"),
    note: z.string().optional(),
    expectedDate: z.string().optional(),
    items: z.array(purchaseOrderItemSchema).min(1, "At least one item is required"),
});

export type PurchaseOrderFormData = z.infer<typeof purchaseOrderSchema>;