"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Plus, Package } from "lucide-react";
import Image from "next/image";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    sellingPrice: number;
    stock: number;
    image?: string;
    category?: string;
  };
  onAddToCart: (product: any) => void;
}