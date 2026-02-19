"use client";

import { useState, useRef, useEffect } from "react";
import { useCustomerStore } from "@/store/customerStore";
import { usePOSStore } from "@/store/posStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  User,
  UserX,
  Search,
  ChevronDown,
  X,
  PersonStanding,
} from "lucide-react";

export default function CustomerSelector() {
  const { customers } = useCustomerStore();
  const { customerId, customerName, setCustomer } = usePOSStore();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const isWalkIn = !customerId && customerName === "Walking Customer";
  const hasCustomer = !!customerId;

  const filtered = query.trim()
    ? customers.filter(
        (c) =>
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          c.phone.includes(query) ||
          c.email.toLowerCase().includes(query.toLowerCase()),
      )
    : customers.slice(0, 20);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectCustomer = (id: string, name: string) => {
    setCustomer(id, name);
    setOpen(false);
    setQuery("");
  };

  const selectWalkIn = () => {
    setCustomer(undefined, "Walking Customer");
    setOpen(false);
    setQuery("");
  };

  const clearCustomer = () => {
    setCustomer(undefined, undefined);
    setQuery("");
  };

  return (
    <div ref={containerRef} className="relative px-4 pt-3 pb-1">
      {/* Trigger / selected state */}
      {hasCustomer || isWalkIn ? (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/60 border border-border">
          <div
            className={`flex items-center justify-center w-6 h-6 rounded-full flex-shrink-0 ${isWalkIn ? "bg-muted-foreground/20" : "bg-primary/10"}`}
          >
            {isWalkIn ? (
              <PersonStanding className="w-3.5 h-3.5 text-muted-foreground" />
            ) : (
              <User className="w-3.5 h-3.5 text-primary" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{customerName}</p>
            {hasCustomer &&
              (() => {
                const c = customers.find((x) => x.id === customerId);
                return c ? (
                  <p className="text-[11px] text-muted-foreground truncate">
                    {c.phone}
                  </p>
                ) : null;
              })()}
          </div>
          {isWalkIn ? (
            <Badge
              variant="secondary"
              className="text-[10px] px-1.5 py-0 flex-shrink-0"
            >
              Walk-in
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="text-[10px] px-1.5 py-0 flex-shrink-0 text-primary border-primary/30"
            >
              Customer
            </Badge>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="w-5 h-5 flex-shrink-0 text-muted-foreground hover:text-destructive"
            onClick={clearCustomer}
            title="Remove"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-between h-9 text-muted-foreground font-normal"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Select customer
          </span>
          <ChevronDown className="w-3.5 h-3.5 opacity-60" />
        </Button>
      )}

      {/* Dropdown */}
      {open && (
        <div className="absolute left-4 right-4 top-full mt-1 z-50 rounded-lg border border-border bg-popover shadow-lg overflow-hidden">
          {/* Search */}
          <div className="p-2 border-b border-border">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                autoFocus
                placeholder="Search by name, phone, email…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-8 pl-7 text-sm"
              />
            </div>
          </div>

          <div className="max-h-56 overflow-y-auto">
            {/* Walk-in option */}
            <button
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-muted transition-colors text-left"
              onClick={selectWalkIn}
            >
              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-muted flex-shrink-0">
                <PersonStanding className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">Walking Customer</p>
                <p className="text-[11px] text-muted-foreground">
                  No account — walk-in sale
                </p>
              </div>
            </button>

            {/* Divider */}
            {filtered.length > 0 && (
              <div className="px-3 py-1 text-[10px] uppercase tracking-wide text-muted-foreground bg-muted/30 border-y border-border">
                Registered Customers
              </div>
            )}

            {/* Customer list */}
            {filtered.map((c) => (
              <button
                key={c.id}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-muted transition-colors text-left"
                onClick={() => selectCustomer(c.id, c.name)}
              >
                <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 flex-shrink-0">
                  <User className="w-3.5 h-3.5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{c.name}</p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {c.phone}
                    {c.email ? ` · ${c.email}` : ""}
                  </p>
                </div>
                {c.loyaltyPoints > 0 && (
                  <Badge
                    variant="secondary"
                    className="text-[10px] px-1.5 flex-shrink-0"
                  >
                    {c.loyaltyPoints} pts
                  </Badge>
                )}
              </button>
            ))}

            {filtered.length === 0 && query && (
              <div className="px-3 py-4 text-sm text-center text-muted-foreground">
                No customers match &ldquo;{query}&rdquo;
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
