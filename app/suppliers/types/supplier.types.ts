export interface Supplier {
    id: string;
    name: string;
    contactPerson: string;
    email: string;
    phone: string;
    createdAt: Date;
    updatedAt: Date;
}

export type SupplierFormData = Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>;