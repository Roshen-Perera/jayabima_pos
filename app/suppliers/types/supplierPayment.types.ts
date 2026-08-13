export type SupplierPaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'CHEQUE';

export interface SupplierPayment {
    id: string;
    supplierId: string;
    supplierName?: string;
    amount: number;
    method: SupplierPaymentMethod;
    reference?: string | null;   // cheque no., bank ref, transfer ID, etc.
    chequeDate?: string | null;  // ISO date string for post-dated cheques
    note?: string | null;
    paidAt: string;              // ISO datetime string
    createdAt: string;
}

export interface CreateSupplierPaymentInput {
    supplierId: string;
    amount: number;
    method: SupplierPaymentMethod;
    reference?: string;
    chequeDate?: string;
    note?: string;
    paidAt?: string;
}
