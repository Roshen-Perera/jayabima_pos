import { z } from "zod";

export const customerSchema = z.object({
    name: z
        .string()
        .min(2, "Name must be at least 2 characters")
        .max(100, "Name must be less than 100 characters"),

    email: z
        .string()
        .email("Invalid email address")
        .optional()
        .or(z.literal(""))
        .nullable(),

    phone: z
        .string()
        .optional()
        .or(z.literal(""))
        .nullable(),

    address: z
        .string()
        .optional()
        .or(z.literal(""))
        .nullable(),
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