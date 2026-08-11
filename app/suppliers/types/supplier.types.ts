import { SupplierFormData } from '../lib/validation';

export interface Supplier {
    id: string;
    name: string;
    contactPerson?: string | null;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    payableBalance: number;
    taxId?: string | null;
    bankName?: string | null;
    accountNumber?: string | null;
    active: boolean;
    deletedAt?: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

export type { SupplierFormData };
