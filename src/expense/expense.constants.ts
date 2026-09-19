export const EXPENSE_CATEGORIES = [
  "HOUSING",
  "FOOD",
  "TRANSPORT",
  "HEALTH",
  "EDUCATION",
  "LEISURE",
  "SUBSCRIPTIONS",
  "UTILITIES",
  "ELECTRONICS",
  "SHOPPING",
  "TAXES",
  "FINANCIAL",
  "OTHER"
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];
