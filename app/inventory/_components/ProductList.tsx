import { useProductStore } from "@/store/productStore";
import { Package } from "lucide-react";
import React from "react";

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
    
    return filtered;
  }, [products, search]);

  if (filteredProducts.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No products found</h3>
        <p className="text-muted-foreground">
          {search  !== "all"
            ? "Try adjusting your filters"
            : "Add your first product to get started"}
        </p>
      </div>
    );
  }
  return <div></div>;
};

export default ProductList;
