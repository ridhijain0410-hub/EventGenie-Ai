import { computeBudgetMetrics } from './src/utils/budgetCalculations';
import { INITIAL_EVENTS, INITIAL_BUDGET_ITEMS } from './src/data/sampleEvents';

console.log('=== EventGenie AI Budget Calculation Test Suite ===\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, testName: string, details?: any) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`✅ [PASS] ${testName}`);
  } else {
    console.error(`❌ [FAIL] ${testName}`, details || '');
  }
}

// TEST 1: Indian Wedding Sample Event (evt-indian-wedding-01)
console.log('--- Test Case 1: Aarav & Priya Jaipur Wedding (INR) ---');
const event1 = INITIAL_EVENTS.find((e) => e.id === 'evt-indian-wedding-01')!;
const items1 = INITIAL_BUDGET_ITEMS.filter((b) => b.eventId === event1.id);

const metrics1 = computeBudgetMetrics(event1, items1);

assert(metrics1.totalBudget === 2800000, 'Total Budget equals ₹28,00,000', metrics1.totalBudget);
assert(metrics1.contingencyReserve === 280000, 'Contingency Reserve equals ₹2,80,000 (10%)', metrics1.contingencyReserve);
assert(metrics1.operatingBudget === 2520000, 'Operating Budget equals ₹25,20,000', metrics1.operatingBudget);
assert(
  metrics1.operatingBudget + metrics1.contingencyReserve === metrics1.totalBudget,
  'Total Budget = Operating Budget + Contingency Reserve (2,520,000 + 280,000 = 2,800,000)'
);
assert(metrics1.actualOperatingExpenses === 2737000, 'Actual Operating Expenses equals ₹27,37,000', metrics1.actualOperatingExpenses);
assert(metrics1.totalActual === 2737000, 'Total Actual Spending equals ₹27,37,000', metrics1.totalActual);
assert(
  metrics1.operatingBudgetRemaining === 2520000 - 2737000 && metrics1.operatingBudgetRemaining === -217000,
  'Operating Budget Remaining = Operating Budget - Actual Operating Expenses (₹25,20,000 - ₹27,37,000 = -₹2,17,000)',
  metrics1.operatingBudgetRemaining
);
assert(
  metrics1.remainingTotalBalance === 2800000 - 2737000 && metrics1.remainingTotalBalance === 63000,
  'Remaining Total Balance = Total Budget - Actual Spending (₹28,00,000 - ₹27,37,000 = +₹63,000)',
  metrics1.remainingTotalBalance
);
assert(metrics1.isOperatingExceeded === true, 'Flags overspending when operating expenses exceed operating budget');
assert(metrics1.overspentOperatingAmount === 217000, 'Overspent operating amount equals ₹2,17,000');
assert(metrics1.isOverBudget === false, 'Total budget is NOT in deficit because ₹2,80,000 contingency buffer covers the ₹2,17,000 overrun');
assert(metrics1.totalPaid === 1562000, 'Total Paid Amount equals ₹15,62,000');
assert(metrics1.pendingPayment === 1175000, 'Pending Balance Due equals ₹11,75,000 (₹27,37,000 - ₹15,62,000)');

console.log('\n--- Test Case 2: Maya & Ethan Napa Wedding (USD) ---');
const event2 = INITIAL_EVENTS.find((e) => e.id === 'evt-wedding-02')!;
const items2 = INITIAL_BUDGET_ITEMS.filter((b) => b.eventId === event2.id);

const metrics2 = computeBudgetMetrics(event2, items2);

assert(metrics2.totalBudget === 35000, 'Total Budget equals $35,000');
assert(metrics2.contingencyReserve === 3500, 'Contingency Reserve equals $3,500 (10%)');
assert(metrics2.operatingBudget === 31500, 'Operating Budget equals $31,500');
assert(
  metrics2.operatingBudget + metrics2.contingencyReserve === metrics2.totalBudget,
  'Total Budget = Operating Budget + Contingency Reserve ($31,500 + $3,500 = $35,000)'
);
assert(metrics2.actualOperatingExpenses === 34250, 'Actual Operating Expenses equals $34,250');
assert(
  metrics2.operatingBudgetRemaining === 31500 - 34250 && metrics2.operatingBudgetRemaining === -2750,
  'Operating Budget Remaining = Operating Budget - Actual Operating Expenses ($31,500 - $34,250 = -$2,750)'
);
assert(
  metrics2.remainingTotalBalance === 35000 - 34250 && metrics2.remainingTotalBalance === 750,
  'Remaining Total Balance = Total Budget - Actual Spending ($35,000 - $34,250 = +$750)'
);
assert(metrics2.isOperatingExceeded === true, 'Operating budget overspending correctly flagged');
assert(metrics2.isOverBudget === false, 'Total budget remains positive (absorbed by contingency)');

console.log('\n--- Test Case 3: Birthday Celebration with Surplus (Under-budget) ---');
const event3 = INITIAL_EVENTS.find((e) => e.id === 'evt-birthday-03')!;
const items3 = INITIAL_BUDGET_ITEMS.filter((b) => b.eventId === event3.id);

const metrics3 = computeBudgetMetrics(event3, items3);

assert(metrics3.totalBudget === 2800, 'Total Budget equals $2,800');
assert(metrics3.contingencyReserve === 224, 'Contingency Reserve equals $224 (8%)');
assert(metrics3.operatingBudget === 2576, 'Operating Budget equals $2,576');
assert(metrics3.actualOperatingExpenses === 1950, 'Actual Operating Expenses equals $1,950');
assert(metrics3.operatingBudgetRemaining === 626, 'Operating Budget Remaining equals +$626 ($2,576 - $1,950)');
assert(metrics3.remainingTotalBalance === 850, 'Remaining Total Balance equals +$850 ($2,800 - $1,950)');
assert(
  metrics3.operatingBudgetRemaining + metrics3.contingencyReserveRemaining === metrics3.remainingTotalBalance,
  'Reconciliation: Operating Remaining ($626) + Contingency Reserve ($224) = Total Remaining ($850)'
);
assert(metrics3.isOperatingExceeded === false, 'Operating budget is NOT exceeded');
assert(metrics3.isOverBudget === false, 'Total budget is NOT exceeded');

console.log('\n--- Test Case 4: Extreme Overspending & Contingency Drawdown ---');
const testEvent = {
  budget: 50000,
  contingencyPercentage: 15, // $7,500 reserve, $42,500 operating
};
const testItems = [
  { category: 'Venue & Rentals', estimatedCost: 20000, actualCost: 25000, paidAmount: 25000 },
  { category: 'Catering & Bar', estimatedCost: 15000, actualCost: 22000, paidAmount: 10000 }, // Operating total = $47,000
  { category: 'Contingency & Misc', estimatedCost: 3000, actualCost: 4000, paidAmount: 4000 }, // Contingency total = $4,000
];

const testMetrics = computeBudgetMetrics(testEvent, testItems);

assert(testMetrics.totalBudget === 50000, 'Total budget is $50,000');
assert(testMetrics.operatingBudget === 42500, 'Operating budget is $42,500');
assert(testMetrics.contingencyReserve === 7500, 'Contingency reserve is $7,500');
assert(testMetrics.actualOperatingExpenses === 47000, 'Actual operating expenses = $47,000');
assert(testMetrics.actualContingencyExpenses === 4000, 'Actual contingency expenses = $4,000');
assert(testMetrics.totalActual === 51000, 'Total actual spending = $51,000 ($47,000 + $4,000)');
assert(
  testMetrics.operatingBudgetRemaining === 42500 - 47000 && testMetrics.operatingBudgetRemaining === -4500,
  'Operating budget remaining = $42,500 - $47,000 = -$4,500 (overspent by $4,500)'
);
assert(
  testMetrics.remainingTotalBalance === 50000 - 51000 && testMetrics.remainingTotalBalance === -1000,
  'Remaining total balance = $50,000 - $51,000 = -$1,000 (overall deficit)'
);
assert(testMetrics.isOperatingExceeded === true, 'Operating budget exceeded flagged as true');
assert(testMetrics.overspentOperatingAmount === 4500, 'Overspent operating amount = $4,500');
assert(testMetrics.isOverBudget === true, 'Total over budget flagged as true');
assert(testMetrics.overspentTotalAmount === 1000, 'Overspent total amount = $1,000');
assert(testMetrics.contingencyReserveRemaining === 3500, 'Contingency remaining = $7,500 - $4,000 = $3,500');

console.log('\n--- Test Case 5: Negative Values Prevention / Sanitization ---');
const negativeItems = [
  { category: 'Venue & Rentals', estimatedCost: -5000, actualCost: -3000, paidAmount: -1000 },
];
const negMetrics = computeBudgetMetrics({ budget: -10000, contingencyPercentage: -5 }, negativeItems);
assert(negMetrics.totalBudget === 0, 'Negative budget clamped to 0');
assert(negMetrics.actualOperatingExpenses === 0, 'Negative operating expense clamped to 0');
assert(negMetrics.totalActual === 0, 'Total actual spending clamped to 0');
assert(negMetrics.remainingTotalBalance === 0, 'Remaining balance with zero spending is 0');

console.log(`\n========================================`);
console.log(`Test Results: ${passedTests} of ${totalTests} assertions passed!`);
if (passedTests === totalTests) {
  console.log('🎉 ALL BUDGET CALCULATIONS MATHEMATICALLY RECONCILE AND PASS!');
} else {
  console.error('❌ SOME TESTS FAILED');
  process.exit(1);
}
