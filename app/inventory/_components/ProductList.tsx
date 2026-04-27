import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useProductStore } from "@/store/productStore";
import { AlertTriangle } from "lucide-react";
import React, { useEffect, useState } from "react";
import ProductActions from "./ProductActions";
import PermissionGuard from "@/lib/rbac/PermissionGuard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ProductList = () => {
  const [tab, setTab] = useState("active");
  const products = useProductStore((s) => s.products);
  const inactiveProducts = useProductStore((s) => s.inactiveProducts);
  const search = useProductStore((s) => s.search);
  const categoryFilter = useProductStore((s) => s.categoryFilter);
  const loadProducts = useProductStore((s) => s.loadProducts);
  const loadInactiveProducts = useProductStore((s) => s.loadInactiveProducts);

  useEffect(() => {
    loadProducts();
    loadInactiveProducts();
  }, [loadProducts, loadInactiveProducts]);

  const filteredProducts = React.useMemo(() => {
    const list = tab === "active" ? products : inactiveProducts;
    if (!search && categoryFilter === "all") return list;

    return list.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        categoryFilter === "all" || p.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [products, inactiveProducts, search, categoryFilter, tab]);

  return (
    <div>
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="active">Active Products</TabsTrigger>
          <TabsTrigger value="inactive">Inactive Products</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No active products found
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
              {filteredProducts.map((product) => {
                const isLowStock = product.stock <= product.minStock;
                const profitMargin =
                  ((product.price - product.cost) / product.price) * 100;

                return (
                  <Card key={product.id}>
                    <CardContent className="px-5">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg">
                              {product.name}
                            </h3>
                            {!product.active && (
                              <Badge variant="secondary">Inactive</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            SKU: {product.sku}
                          </p>
                        </div>
                        <PermissionGuard permission="inventory:delete">
                          <ProductActions product={product} type="active" />
                        </PermissionGuard>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            Category
                          </span>
                          <Badge variant="outline">{product.category}</Badge>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            Stock
                          </span>
                          <div className="flex items-center gap-2">
                            {isLowStock && (
                              <AlertTriangle className="w-4 h-4 text-orange-600" />
                            )}
                            <span
                              className={`font-semibold ${
                                isLowStock ? "text-orange-600" : ""
                              }`}
                            >
                              {product.stock} units
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted-foreground">
                            Price
                          </span>
                          <span className="font-semibold text-sm">
                            Rs. {product.price.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Cost</span>
                          <span>Rs. {product.cost.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm mt-1">
                          <span className="text-muted-foreground">
                            Profit Margin
                          </span>
                          <span className="text-green-600 font-medium">
                            {profitMargin.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
        <TabsContent value="inactive" className="mt-6">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No inactive products found
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
              {filteredProducts.map((product) => {
                const isLowStock = product.stock <= product.minStock;
                const profitMargin =
                  ((product.price - product.cost) / product.price) * 100;

                return (
                  <Card key={product.id}>
                    <CardContent className="px-5">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg">
                              {product.name}
                            </h3>
                            {!product.active && (
                              <Badge variant="secondary">Inactive</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            SKU: {product.sku}
                          </p>
                        </div>
                        <PermissionGuard permission="inventory:delete">
                          <ProductActions product={product} type="inactive" />
                        </PermissionGuard>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            Category
                          </span>
                          <Badge variant="outline">{product.category}</Badge>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            Stock
                          </span>
                          <div className="flex items-center gap-2">
                            {isLowStock && (
                              <AlertTriangle className="w-4 h-4 text-orange-600" />
                            )}
                            <span
                              className={`font-semibold ${
                                isLowStock ? "text-orange-600" : ""
                              }`}
                            >
                              {product.stock} units
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted-foreground">
                            Price
                          </span>
                          <span className="font-semibold text-sm">
                            Rs. {product.price.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Cost</span>
                          <span>Rs. {product.cost.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm mt-1">
                          <span className="text-muted-foreground">
                            Profit Margin
                          </span>
                          <span className="text-green-600 font-medium">
                            {profitMargin.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProductList;
