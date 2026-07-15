export interface Customer {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    loyaltyPoints: number;
    creditBalance: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}