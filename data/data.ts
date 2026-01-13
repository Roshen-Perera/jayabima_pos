import { Customer } from "@/app/customers/types/customer.types";

export const customers: Customer[] = [
    { id: '1', name: 'Mahesh Silva', phone: '0771234567', email: 'mahesh@gmail.com', creditBalance: 45000, loyaltyPoints: 1250, totalPurchases: 285000, status: 'active' },
    { id: '2', name: 'Nimal Fernando', phone: '0772345678', email: 'nimal@gmail.com', creditBalance: 0, loyaltyPoints: 890, totalPurchases: 156000, status: 'active' },
    { id: '3', name: 'Sunil Perera', phone: '0773456789', email: 'sunil@gmail.com', creditBalance: 12500, loyaltyPoints: 2100, totalPurchases: 420000, status: 'active' },
    { id: '4', name: 'Ranjith Kumar', phone: '0774567890', email: 'ranjith@gmail.com', creditBalance: 78000, loyaltyPoints: 560, totalPurchases: 95000, status: 'active' },
    { id: '5', name: 'Kamal Jayasinghe', phone: '0775678901', email: 'kamal@gmail.com', creditBalance: 0, loyaltyPoints: 3200, totalPurchases: 650000, status: 'vip' },
];