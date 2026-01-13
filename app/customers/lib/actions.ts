// app/customers/_lib/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { customerSchema } from "./validation";

export async function createCustomer(formData: FormData) {
    // Parse form data
    const rawData = {
        name: formData.get("name"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        address: formData.get("address"),
    };

    // Validate with Zod
    const validatedFields = customerSchema.safeParse(rawData);

    if (!validatedFields.success) {
        return {
            success: false,
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Validation failed. Please check your inputs.",
        };
    }

    try {
        // TODO: Save to database
        // await db.customer.create({
        //   data: validatedFields.data
        // });

        // Simulate database operation
        console.log("Creating customer:", validatedFields.data);

        // Revalidate the customers page
        revalidatePath("/customers");

        return {
            success: true,
            message: "Customer created successfully!",
        };
    } catch (error) {
        return {
            success: false,
            message: "Failed to create customer. Please try again.",
        };
    }
}
