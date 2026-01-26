import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useProductStore } from "@/store/productStore";
import { AlertTriangle, Package } from "lucide-react";
import React from "react";
import ProductActions from "./ProductActions";

const ProductList = () => {
  const products = useProductStore((s) => s.products);
  const search = useProductStore((s) => s.search);
  const categoryFilter = useProductStore((s) => s.categoryFilter);

  const filteredProducts = React.useMemo(() => {
    let filtered = products;

    // Search filter
    if (search) {
      const keyword = search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(keyword) ||
          p.sku.toLowerCase().includes(keyword) ||
          p.category.toLowerCase().includes(keyword),
      );
    }

    if (categoryFilter && categoryFilter !== "all") {
      filtered = filtered.filter((p) => p.category === categoryFilter);
    }

    return filtered;
  }, [products, search, categoryFilter]);

  if (filteredProducts.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No products found</h3>
        <p className="text-muted-foreground">
          {search !== "all"
            ? "Try adjusting your filters"
            : "Add your first product to get started"}
        </p>
      </div>
    );
  }

  return (
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
                    <h3 className="font-semibold text-lg">{product.name}</h3>
                    {!product.active && (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    SKU: {product.sku}
                  </p>
                </div>
                <ProductActions product={product} />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Category</span>
                  <Badge variant="outline">{product.category}</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Stock</span>
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
                  <span className="text-sm text-muted-foreground">Price</span>
                  <span className="font-semibold text-lg">
                    Rs. {product.price.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Cost</span>
                  <span>Rs. {product.cost.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="text-muted-foreground">Profit Margin</span>
                  <span className="text-green-600 font-medium">
                    {profitMargin.toFixed(1)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default ProductList;
