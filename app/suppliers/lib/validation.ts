import { z } from "zod";

export const supplierSchema = z.object({
    name: z.string().min(2, "Supplier name must be at least 2 characters"),
    contactPerson: z.string().min(2, "Contact person name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Phone number must be at least 10 digits"),
    address: z.string().min(5, "Address is required"),
    active: z.boolean()
});

export type SupplierFormData = z.infer<typeof supplierSchema>;