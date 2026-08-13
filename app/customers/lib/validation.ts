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

export const customerPaymentSchema = z
    .object({
        customerId: z.string().min(1, "Customer is required"),
        amount: z.coerce.number().positive("Payment amount must be greater than 0"),
        method: z.enum(["CASH", "BANK_TRANSFER", "CHEQUE"]),
        reference: z.string().optional().nullable(),
        chequeDate: z.string().optional().nullable(),  // ISO date string for post-dated cheques
        note: z.string().optional().nullable(),
        paidAt: z.string().optional().nullable(),      // ISO datetime string
    })
    .refine(
        (data) => {
            if (data.method === "CHEQUE") {
                return !!data.reference && data.reference.trim().length > 0;
            }
            return true;
        },
        {
            message: "Cheque number is required for Cheque payments",
            path: ["reference"],
        }
    );

export type CustomerPaymentFormData = z.infer<typeof customerPaymentSchema>;