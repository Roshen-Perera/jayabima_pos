"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingUp, Calendar } from "lucide-react";

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
      maximumFractionDigits: 0,
    })
      .format(amount)
      .replace("LKR", "Rs.");
  };

  const total7DayRevenue = trend.reduce((sum, item) => sum + item.revenue, 0);
  const total7DayCount = trend.reduce((sum, item) => sum + item.count, 0);
  const maxRevenue = Math.max(...trend.map((item) => item.revenue), 1000);

  if (isLoading) {
    return (
      <Card className="animate-pulse shadow-sm">
        <CardHeader className="p-5 pb-2">
          <div className="h-5 w-40 bg-muted rounded"></div>
          <div className="h-4 w-56 bg-muted rounded mt-1"></div>
        </CardHeader>
        <CardContent className="p-5 pt-4">
          <div className="h-48 w-full bg-muted/40 rounded-lg flex items-end justify-between p-4 gap-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="w-full bg-muted rounded-t h-2/3"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm border">
      <CardHeader className="p-5 pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-orange-500" />
              7-Day Sales Trend
            </CardTitle>
            <CardDescription className="text-xs mt-0.5">
              Daily revenue for the past week
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-sm font-bold text-foreground">
              {formatCurrency(total7DayRevenue)}
            </div>
            <div className="text-xs text-muted-foreground">
              {total7DayCount} total sales
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-5 pt-2">
        {/* Hover detail box */}
        <div className="h-8 mb-2 flex items-center justify-between text-xs px-2 py-1 bg-muted/30 rounded border border-border/50">
          {hoveredDay ? (
            <>
              <span className="font-semibold text-foreground">
                {hoveredDay.label}:
              </span>
              <span className="text-orange-600 dark:text-orange-400 font-bold">
                {formatCurrency(hoveredDay.revenue)} ({hoveredDay.count} sales)
              </span>
            </>
          ) : (
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              Hover over a column to view daily breakdown
            </span>
          )}
        </div>

        {/* Chart SVG / Bars */}
        <div className="h-44 flex items-end justify-between gap-2 pt-4 px-1">
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
                {/* Bar wrapper */}
                <div className="w-full flex-1 flex items-end justify-center relative">
                  <div
                    className={`w-full max-w-[36px] rounded-t-md transition-all duration-300 ${
                      isToday
                        ? "bg-orange-500 group-hover:bg-orange-600 shadow-sm"
                        : item.revenue > 0
                        ? "bg-orange-400/80 dark:bg-orange-500/60 group-hover:bg-orange-500"
                        : "bg-muted hover:bg-muted/80"
                    }`}
                    style={{
                      height: `${Math.max(heightPercent, 4)}%`,
                    }}
                  >
                    {/* Inner highlight */}
                    <div className="w-full h-1 bg-white/20 rounded-t-md" />
                  </div>
                </div>

                {/* Day label */}
                <div className="mt-2 text-center">
                  <span
                    className={`text-[11px] block font-medium ${
                      isToday
                        ? "text-orange-600 dark:text-orange-400 font-bold"
                        : "text-muted-foreground group-hover:text-foreground"
                    }`}
                  >
                    {item.label.split(" ")[0]}
                  </span>
                  <span className="text-[10px] text-muted-foreground block -mt-0.5">
                    {item.label.split(" ")[1] || ""}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
