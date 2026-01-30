import { Supplier } from './../app/suppliers/types/supplier.types';

interface SupplierStore {
    suppliers: Supplier[];

    setSuppliers: (suppliers: Supplier[]) => void;
}