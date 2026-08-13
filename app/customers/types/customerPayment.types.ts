export type CustomerPaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'CHEQUE';

export interface CustomerPayment {
    id: string;
    customerId: string;
    customerName?: string;
    amount: number;
    method: CustomerPaymentMethod;
    reference?: string | null;   // cheque no., bank ref, transfer ID, etc.
    chequeDate?: string | null;  // ISO date string for post-dated cheques
    note?: string | null;
    paidAt: string;              // ISO datetime string
    createdAt: string;
}

export interface CreateCustomerPaymentInput {
    customerId: string;
    amount: number;
    method: CustomerPaymentMethod;
    reference?: string;
    chequeDate?: string;
    note?: string;
    paidAt?: string;
}
