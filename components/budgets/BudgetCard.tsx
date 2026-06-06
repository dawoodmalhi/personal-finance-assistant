"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BudgetCardProps {
  id: string;
  category: string;
  limitAmount: number;
  spent: number;
  period: string;
}

export function BudgetCard({
  category,
  limitAmount,
  spent,
  period,
}: BudgetCardProps) {
  const percentage = Math.min((spent / limitAmount) * 100, 100);

  let colorClass = "bg-green-500";
  if (percentage >= 90) colorClass = "bg-red-500";
  else if (percentage >= 70) colorClass = "bg-amber-500";

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium capitalize flex justify-between">
          <span>{category}</span>
          <span className="text-muted-foreground font-normal text-xs">
            {period}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-baseline mb-2">
          <span className="text-2xl font-bold">
            ${Number(spent).toFixed(2)}
          </span>
          <span className="text-sm text-muted-foreground">
            of ${Number(limitAmount).toFixed(2)}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${colorClass}`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        {percentage >= 90 && (
          <p className="text-xs text-red-500 mt-2 font-medium">
            Approaching or over limit!
          </p>
        )}
      </CardContent>
    </Card>
  );
}
