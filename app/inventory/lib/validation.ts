import { z } from 'zod';

export const productSchema = z.object({
    name: z
        .string()
        .min(2, 'Product name must be at least 2 characters')
        .max(100, 'Product name must be less than 100 characters'),

    category: z
        .string()
        .min(1, 'Category is required'),

    sku: z
        .string()
        .min(1, 'SKU is required')
        .max(50, 'SKU must be less than 50 characters'),

    price: z
        .number()
        .min(0, 'Price must be greater than or equal to 0'),

    cost: z
        .number()
        .min(0, 'Cost must be greater than or equal to 0'),

    stock: z
        .number()
        .int()
        .min(0, 'Stock must be a non-negative integer')
        .optional(),

    minStock: z
        .number()
        .int()
        .min(0, 'Minimum stock must be a non-negative integer')
        .optional(),

    description: z
        .string()
        .max(500, 'Description must be less than 500 characters')
        .optional(),

    image: z
        .string()
        .optional(),

    active: z.boolean().optional(),
    supplierId: z.string().optional(),
});

export type ProductFormData = z.infer<typeof productSchema>;