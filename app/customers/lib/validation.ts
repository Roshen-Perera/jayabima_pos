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
});

export type CustomerFormData = z.infer<typeof customerSchema>;