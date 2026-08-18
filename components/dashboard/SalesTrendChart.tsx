"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

interface SalesTrendItem {
  dateStr: string;
  label: string;
  revenue: number;
  count: number;
}

interface SalesTrendChartProps {
  trend: SalesTrendItem[];
  isLoading?: boolean;
}

export function SalesTrendChart({ trend, isLoading }: SalesTrendChartProps) {
  const [hoveredDay, setHoveredDay] = useState<SalesTrendItem | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      minimumFractionDigits: 0,
    })
      .format(amount)
      .replace("LKR", "Rs.");
  };

  const total7DayRevenue = trend.reduce((sum, item) => sum + item.revenue, 0);
  const total7DayCount = trend.reduce((sum, item) => sum + item.count, 0);
  const maxRevenue = Math.max(...trend.map((item) => item.revenue), 1000);

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-4 space-y-4">
          <div className="h-4 w-32 bg-muted rounded"></div>
          <div className="h-36 w-full bg-muted/40 rounded"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-orange-500" />
            7-Day Sales Trend
          </CardTitle>
          <CardDescription className="text-xs">
            Daily revenue over the past week
          </CardDescription>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold">{formatCurrency(total7DayRevenue)}</p>
          <p className="text-xs text-muted-foreground">{total7DayCount} sales</p>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-2">
        {/* Info bar */}
        <div className="h-6 mb-2 flex items-center justify-between text-xs px-2 bg-muted/40 rounded text-muted-foreground">
          {hoveredDay ? (
            <>
              <span className="font-medium text-foreground">{hoveredDay.label}</span>
              <span className="font-semibold text-orange-500">
                {formatCurrency(hoveredDay.revenue)} ({hoveredDay.count} sales)
              </span>
            </>
          ) : (
            <span>Hover bars to view daily amounts</span>
          )}
        </div>

        {/* Chart columns */}
        <div className="h-36 flex items-end justify-between gap-2 pt-2">
          {trend.map((item, index) => {
            const heightPercent = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;
            const isToday = index === trend.length - 1;

            return (
              <div
                key={item.dateStr}
                className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                onMouseEnter={() => setHoveredDay(item)}
                onMouseLeave={() => setHoveredDay(null)}
              >
                <div className="w-full flex-1 flex items-end justify-center">
                  <div
                    className={`w-full max-w-[28px] rounded-t transition-all ${
                      isToday
                        ? "bg-orange-500"
                        : item.revenue > 0
                        ? "bg-orange-400/70 dark:bg-orange-500/50 group-hover:bg-orange-500"
                        : "bg-muted"
                    }`}
                    style={{
                      height: `${Math.max(heightPercent, 4)}%`,
                    }}
                  />
                </div>
                <span
                  className={`text-[11px] mt-1.5 ${
                    isToday ? "font-bold text-orange-500" : "text-muted-foreground"
                  }`}
                >
                  {item.label.split(" ")[0]}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
