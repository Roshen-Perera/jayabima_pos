import { Supplier } from "../types/supplier.types";

interface SupplierFormProps {
    supplier?: Supplier;
    mode: "add" | "edit";
    open: boolean;
}