import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac/api-guard";
import { NextRequest, NextResponse } from "next/server";
import { startOfDay, endOfDay, subDays, format } from "date-fns";

export async function GET(request: NextRequest) {
  const { authorized, response } = await requirePermission(
    request,
    "dashboard:view"
  );
  if (!authorized) return response;

  try {
    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);
    const sevenDaysAgo = startOfDay(subDays(now, 6));

    // 1. Sales today
    const salesToday = await prisma.sale.findMany({
      where: {
        status: "COMPLETED",
        deletedAt: null,
        createdAt: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
      select: {
        total: true,
      },
    });

    const todaySalesCount = salesToday.length;
    const todayRevenue = salesToday.reduce(
      (sum, s) => sum + Number(s.total || 0),
      0
    );

    // 2. Total Customers & Receivables (Positive credit balances)
    const customers = await prisma.customer.findMany({
      where: { deletedAt: null },
      select: { creditBalance: true },
    });
    const totalReceivables = customers.reduce(
      (sum, c) => sum + Math.max(0, Number(c.creditBalance || 0)),
      0
    );
    const totalCustomersCount = customers.length;

    // 3. Total Suppliers & Payables (Positive payable balances)
    const suppliers = await prisma.supplier.findMany({
      where: { deletedAt: null },
      select: { payableBalance: true },
    });
    const totalPayables = suppliers.reduce(
      (sum, s) => sum + Math.max(0, Number(s.payableBalance || 0)),
      0
    );
    const totalSuppliersCount = suppliers.length;

    // 4. Products & Low Stock Alerts
    const allProducts = await prisma.product.findMany({
      where: { active: true },
      select: {
        id: true,
        name: true,
        sku: true,
        category: true,
        stock: true,
        minStock: true,
        price: true,
      },
    });

    const totalProductsCount = allProducts.length;
    const lowStockItems = allProducts.filter((p) => p.stock <= p.minStock);
    const lowStockCount = lowStockItems.length;
    const topLowStock = lowStockItems.slice(0, 5);

    // 5. 7-Day Sales Revenue Trend
    const salesLast7Days = await prisma.sale.findMany({
      where: {
        status: "COMPLETED",
        deletedAt: null,
        createdAt: {
          gte: sevenDaysAgo,
          lte: todayEnd,
        },
      },
      select: {
        total: true,
        createdAt: true,
      },
    });

    // Map each of the last 7 days
    const trendMap = new Map<string, { dateStr: string; label: string; revenue: number; count: number }>();
    for (let i = 6; i >= 0; i--) {
      const d = subDays(now, i);
      const key = format(d, "yyyy-MM-dd");
      const label = format(d, "EEE (d MMM)"); // e.g. Mon (18 Aug)
      trendMap.set(key, { dateStr: key, label, revenue: 0, count: 0 });
    }

    salesLast7Days.forEach((sale) => {
      const key = format(new Date(sale.createdAt), "yyyy-MM-dd");
      if (trendMap.has(key)) {
        const current = trendMap.get(key)!;
        current.revenue += Number(sale.total || 0);
        current.count += 1;
      }
    });

    const salesTrend = Array.from(trendMap.values());

    // 6. Recent 5 Sales Transactions
    const recentSales = await prisma.sale.findMany({
      where: {
        status: "COMPLETED",
        deletedAt: null,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
          },
        },
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    const formattedRecentSales = recentSales.map((sale) => ({
      id: sale.id,
      customerName: sale.customer?.name || "Walk-in Customer",
      cashierName: sale.user.name,
      total: Number(sale.total),
      paymentMethod: sale.paymentMethod,
      createdAt: sale.createdAt,
    }));

    // 7. Top Selling Products
    const topSalesItemsGroup = await prisma.saleItem.groupBy({
      by: ["productId", "productName"],
      _sum: {
        quantity: true,
        total: true,
      },
      take: 5,
      orderBy: {
        _sum: {
          quantity: "desc",
        },
      },
    });

    const topProducts = topSalesItemsGroup.map((item) => ({
      productId: item.productId,
      name: item.productName,
      totalSold: item._sum.quantity || 0,
      totalRevenue: Number(item._sum.total || 0),
    }));

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          todayRevenue,
          todaySalesCount,
          totalReceivables,
          totalPayables,
          totalCustomersCount,
          totalSuppliersCount,
          totalProductsCount,
          lowStockCount,
        },
        salesTrend,
        topLowStock,
        recentSales: formattedRecentSales,
        topProducts,
      },
    });
  } catch (error) {
    console.error("Error generating dashboard summary:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch dashboard metrics" },
      { status: 500 }
    );
  }
}
