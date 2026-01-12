"use client"

import { navItems } from "@/constants/data";
import { usePathname } from "next/navigation";
import React from "react";

const DynamicTitle = () => {
  const pathname = usePathname();
  return (
    <div>
      <h1 className="text-base font-medium">
        {navItems.find((item) => item.url === pathname)?.title || "Dashboard"}
      </h1>
    </div>
  );
};

export default DynamicTitle;
