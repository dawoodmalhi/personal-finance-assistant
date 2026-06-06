"use client";

import { useState, useEffect } from "react";
import { BudgetCard } from "@/components/budgets/BudgetCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus, AlertCircle } from "lucide-react";

// Fallback categories for brand new users with no transactions
const DEFAULT_CATEGORIES = [
  "Groceries",
  "Transport",
  "Subscriptions",
  "Dining",
  "Shopping",
  "Healthcare",
  "Utilities",
];

const PERIODS = ["MONTHLY", "WEEKLY"] as const;

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<any[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [category, setCategory] = useState<string>(DEFAULT_CATEGORIES[0]);
  const [limitAmount, setLimitAmount] = useState("");
  const [period, setPeriod] = useState<string>(PERIODS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPageData = async () => {
    setError(null);
    try {
      // Fetch both endpoints concurrently to save time
      const [budgetsRes, categoriesRes] = await Promise.all([
        fetch("/api/budgets"),
        fetch("/api/categories")
      ]);

      if (!budgetsRes.ok) throw new Error(`Failed to load budgets (Status: ${budgetsRes.status})`);
      if (!categoriesRes.ok) throw new Error(`Failed to load categories (Status: ${categoriesRes.status})`);

      const budgetsData = await budgetsRes.json();
      const categoriesData = await categoriesRes.json();

      if (budgetsData.error) throw new Error(budgetsData.error);
      if (categoriesData.error) throw new Error(categoriesData.error);

      // Merge DB categories with defaults, then use a Set to remove duplicates
      const mergedCategories = Array.from(new Set([...DEFAULT_CATEGORIES, ...(categoriesData || [])]));
      
      setAvailableCategories(mergedCategories);
      setBudgets(Array.isArray(budgetsData) ? budgetsData : []);
      
      // Ensure the default selected category actually exists in the newly merged list
      if (!category || !mergedCategories.includes(category)) {
        setCategory(mergedCategories[0]);
      }
      
    } catch (err: any) {
      setError(err.message || "An unknown error occurred while fetching data.");
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPageData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          category, 
          limitAmount: parseFloat(limitAmount),
          period 
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Server responded with status ${res.status}`);
      }

      setLimitAmount("");
      // Only refetch the budgets (no need to refetch categories on a budget update)
      const budgetsRes = await fetch("/api/budgets");
      const budgetsData = await budgetsRes.json();
      setBudgets(Array.isArray(budgetsData) ? budgetsData : []);
    } catch (err: any) {
      setError(err.message || "Could not save budget. Check server terminal.");
      console.error("Submit error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center min-h-[400px]">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Budgets</h1>
        <p className="text-sm text-muted-foreground">Manage your spending limits.</p>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-900 dark:bg-red-950/20 dark:text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4 auto-rows-max">
          {budgets.map((b) => (
            <BudgetCard key={b.id} {...b} />
          ))}
          {budgets.length === 0 && !error && (
            <div className="col-span-full p-12 border border-dashed rounded-lg text-center text-muted-foreground">
              No budgets setup yet. Use the sidebar to create your first spending limit rule.
            </div>
          )}
        </div>

        <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4 auto-rows-max">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Plus className="h-4 w-4" /> Add Budget
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddBudget} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-foreground">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    {availableCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-foreground">Tracking Period</label>
                  <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring capitalize"
                  >
                    {PERIODS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-foreground">Limit Amount ($)</label>
                  <input 
                    type="number" 
                    required
                    min="1"
                    step="0.01"
                    value={limitAmount}
                    onChange={(e) => setLimitAmount(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" 
                    placeholder="400.00" 
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-50 gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin h-4 w-4" />
                      Saving...
                    </>
                  ) : (
                    "Save Budget"
                  )}
                </button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}