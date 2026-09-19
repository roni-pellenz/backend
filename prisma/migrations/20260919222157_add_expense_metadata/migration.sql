-- CreateEnum
CREATE TYPE "ExpenseCategory" AS ENUM ('HOUSING', 'FOOD', 'TRANSPORT', 'HEALTH', 'EDUCATION', 'LEISURE', 'SUBSCRIPTIONS', 'UTILITIES', 'ELECTRONICS', 'SHOPPING', 'TAXES', 'FINANCIAL', 'OTHER');

-- AlterTable
ALTER TABLE "expense_recurrences" ADD COLUMN     "category" "ExpenseCategory",
ADD COLUMN     "notes" VARCHAR(500),
ADD COLUMN     "notification_days_before" INTEGER;

-- AlterTable
ALTER TABLE "expenses" ADD COLUMN     "category" "ExpenseCategory",
ADD COLUMN     "notes" VARCHAR(500),
ADD COLUMN     "notification_days_before" INTEGER;

-- AlterTable
ALTER TABLE "installment_plans" ADD COLUMN     "category" "ExpenseCategory",
ADD COLUMN     "notes" VARCHAR(500),
ADD COLUMN     "notification_days_before" INTEGER;
