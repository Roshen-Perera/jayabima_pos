import { z } from "zod";

export const productSchema = z.object({
    name: z.string().min(2, "Product name must be at least 2 characters"),
    category: z.string().min(2, "Category is required"),
    sku: z.string().min(1, "SKU is required"),
    supplierId: z.string().optional(),
    price: z.number().min(0, "Price must be positive"),
    cost: z.number().min(0, "Cost must be positive"),
    stock: z.number().min(0, "Stock cannot be negative"),
    minStock: z.number().min(0, "Minimum stock cannot be negative"),
    description: z.string().optional(),
    active: z.boolean()
});

export type ProductFormData = z.infer<typeof productSchema>;