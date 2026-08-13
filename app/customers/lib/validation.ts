import { z } from "zod";

export const customerSchema = z.object({
    name: z
        .string()
        .min(2, "Name must be at least 2 characters")
        .max(100, "Name must be less than 100 characters")
        .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"),

    email: z
        .string()
        .email("Invalid email address")
        .min(1, "Email is required"),

    phone: z
        .string()
        .min(10, "Phone number must be at least 10 digits")
        .max(15, "Phone number must be less than 15 digits")
        .regex(/^[0-9+\s()-]+$/, "Invalid phone number format"),

    address: z
        .string()
        .min(5, "Address must be at least 5 characters")
        .max(200, "Address must be less than 200 characters"),
    isActive: z.boolean().optional(),
});

export type CustomerFormData = z.infer<typeof customerSchema>;

export const customerPaymentSchema = z.object({
    customerId: z.string().min(1, "Customer is required"),
    amount: z.number().positive("Amount must be greater than 0"),
    method: z.enum(["CASH", "BANK_TRANSFER", "CHEQUE"]),
    reference: z.string().optional(),
    chequeDate: z.string().optional(),  // ISO date string for post-dated cheques
    note: z.string().optional(),
    paidAt: z.string().optional(),      // ISO datetime string
});

export type CustomerPaymentFormData = z.infer<typeof customerPaymentSchema>;