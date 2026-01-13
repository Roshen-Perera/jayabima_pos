import { useState, useMemo } from "react";
import { Customer } from "../types/customer.types";
import { customers } from "@/data/data";

export function useCustomers() {
    const [customers, setCustomers] = useState<Customer[]>(customers);
    const [search, setSearch] = useState("");

    const filteredCustomers = useMemo(() => {
        if (!search) return customers;

        const keyword = search.toLowerCase();

        return customers.filter((c) =>
            c.name.toLowerCase().includes(keyword) ||
            c.email.toLowerCase().includes(keyword) ||
            c.phone.includes(keyword)
        );
    }, [customers, search]);

    return {
        customers,
        filteredCustomers,
        search,
        setSearch,
        setCustomers,
    };
}