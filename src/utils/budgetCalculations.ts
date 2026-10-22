/**
 * Core mathematical engine for EventGenie AI Budget Planner.
 * Provides a single source of truth for all budget calculations across the application.
 */

export interface EventBudgetInput {
  budget: number;
  contingencyPercentage?: number;
}

export interface BudgetItemInput {
  category: string;
  estimatedCost: number;
  actualCost: number;
  paidAmount: number;
}

export interface ComputedBudgetMetrics {
  // Budget breakdown
  totalBudget: number;
  contingencyPercentage: number;
  contingencyReserve: number;
  operatingBudget: number;

  // Expenses categorization
  actualOperatingExpenses: number;
  actualContingencyExpenses: number;
  estimatedOperatingExpenses: number;
  estimatedContingencyExpenses: number;

  // Totals
  totalEstimated: number;
  totalActual: number;
  totalPaid: number;
  pendingPayment: number;

  // Balances
  operatingBudgetRemaining: number;
  contingencyReserveRemaining: number;
  remainingTotalBalance: number;
  // Alias for backward compatibility
  remainingOperatingBalance: number;

  // Percentages & Indicators
  actualSpentPercentage: number;
  operatingSpentPercentage: number;
  isOperatingExceeded: boolean;
  overspentOperatingAmount: number;
  isOverBudget: boolean;
  overspentTotalAmount: number;
}

/**
 * Computes all budget metrics in accordance with the application's financial architecture:
 * 1. Total budget = operating budget + contingency reserve.
 * 2. Remaining total balance = total budget - actual spending.
 * 3. Operating budget remaining = operating budget - actual operating expenses.
 * 4. Contingency reserve is tracked separately and never counted twice.
 * 5. Flags overspending when operating expenses exceed the operating budget.
 */
export function computeBudgetMetrics(
  event: EventBudgetInput | null | undefined,
  items: BudgetItemInput[]
): ComputedBudgetMetrics {
  const totalBudget = Math.max(0, event?.budget || 0);
  const contingencyPercentage = Math.max(0, Math.min(100, event?.contingencyPercentage ?? 10));
  
  // Total budget = operating budget + contingency reserve
  const contingencyReserve = Math.round((totalBudget * contingencyPercentage) / 100);
  const operatingBudget = Math.max(0, totalBudget - contingencyReserve);

  let actualOperatingExpenses = 0;
  let actualContingencyExpenses = 0;
  let estimatedOperatingExpenses = 0;
  let estimatedContingencyExpenses = 0;
  let totalPaid = 0;

  for (const item of items) {
    const est = Math.max(0, Number(item.estimatedCost) || 0);
    const act = Math.max(0, Number(item.actualCost) || 0);
    const paid = Math.max(0, Number(item.paidAmount) || 0);

    const isContingency = item.category === 'Contingency & Misc';
    if (isContingency) {
      actualContingencyExpenses += act;
      estimatedContingencyExpenses += est;
    } else {
      actualOperatingExpenses += act;
      estimatedOperatingExpenses += est;
    }
    totalPaid += paid;
  }

  const totalActual = actualOperatingExpenses + actualContingencyExpenses;
  const totalEstimated = estimatedOperatingExpenses + estimatedContingencyExpenses;
  const pendingPayment = Math.max(0, totalActual - totalPaid);

  // Exact formulas:
  // Remaining total balance = total budget - actual spending
  const remainingTotalBalance = totalBudget - totalActual;

  // Operating budget remaining = operating budget - actual operating expenses
  const operatingBudgetRemaining = operatingBudget - actualOperatingExpenses;

  // Contingency reserve remaining
  const contingencyReserveRemaining = Math.max(0, contingencyReserve - actualContingencyExpenses);

  const actualSpentPercentage =
    totalBudget > 0 ? Math.min(Math.round((totalActual / totalBudget) * 100), 100) : 0;
  const operatingSpentPercentage =
    operatingBudget > 0
      ? Math.min(Math.round((actualOperatingExpenses / operatingBudget) * 100), 100)
      : 0;

  // Flag overspending when operating expenses exceed the operating budget
  const isOperatingExceeded = actualOperatingExpenses > operatingBudget;
  const overspentOperatingAmount = Math.max(0, actualOperatingExpenses - operatingBudget);

  // Flag overspending when total spending exceeds total budget
  const isOverBudget = totalActual > totalBudget;
  const overspentTotalAmount = Math.max(0, totalActual - totalBudget);

  return {
    totalBudget,
    contingencyPercentage,
    contingencyReserve,
    operatingBudget,

    actualOperatingExpenses,
    actualContingencyExpenses,
    estimatedOperatingExpenses,
    estimatedContingencyExpenses,

    totalEstimated,
    totalActual,
    totalPaid,
    pendingPayment,

    operatingBudgetRemaining,
    contingencyReserveRemaining,
    remainingTotalBalance,
    remainingOperatingBalance: operatingBudgetRemaining,

    actualSpentPercentage,
    operatingSpentPercentage,

    isOperatingExceeded,
    overspentOperatingAmount,
    isOverBudget,
    overspentTotalAmount,
  };
}
