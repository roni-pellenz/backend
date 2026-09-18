-- CreateEnum
CREATE TYPE "RecurrenceFrequency" AS ENUM ('WEEKLY', 'MONTHLY', 'YEARLY');

-- CreateTable
CREATE TABLE "expense_recurrences" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "amount" INTEGER NOT NULL,
    "frequency" "RecurrenceFrequency" NOT NULL,
    "due_day" INTEGER NOT NULL,
    "planned_payment_day" INTEGER,
    "start_competence" DATE NOT NULL,
    "end_competence" DATE,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "expense_recurrences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "installment_plans" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "total_amount" INTEGER NOT NULL,
    "installments" INTEGER NOT NULL,
    "purchase_date" DATE NOT NULL,
    "first_installment_date" DATE NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "installment_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expenses" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "recurrence_id" UUID,
    "installment_plan_id" UUID,
    "installment_number" INTEGER,
    "name" VARCHAR(150) NOT NULL,
    "amount" INTEGER NOT NULL,
    "competence" DATE NOT NULL,
    "due_date" DATE NOT NULL,
    "planned_payment_date" DATE,
    "paid_date" DATE,
    "paid_amount" INTEGER,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "expenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "income_recurrences" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "amount" INTEGER NOT NULL,
    "frequency" "RecurrenceFrequency" NOT NULL,
    "receipt_day" INTEGER NOT NULL,
    "start_competence" DATE NOT NULL,
    "end_competence" DATE,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "income_recurrences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incomes" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "recurrence_id" UUID,
    "name" VARCHAR(150) NOT NULL,
    "amount" INTEGER NOT NULL,
    "competence" DATE NOT NULL,
    "expected_date" DATE NOT NULL,
    "received_date" DATE,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "incomes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "expense_recurrences_user_id_idx" ON "expense_recurrences"("user_id");

-- CreateIndex
CREATE INDEX "installment_plans_user_id_idx" ON "installment_plans"("user_id");

-- CreateIndex
CREATE INDEX "expenses_user_id_competence_idx" ON "expenses"("user_id", "competence");

-- CreateIndex
CREATE INDEX "expenses_user_id_due_date_idx" ON "expenses"("user_id", "due_date");

-- CreateIndex
CREATE INDEX "expenses_recurrence_id_idx" ON "expenses"("recurrence_id");

-- CreateIndex
CREATE INDEX "expenses_installment_plan_id_idx" ON "expenses"("installment_plan_id");

-- CreateIndex
CREATE INDEX "income_recurrences_user_id_idx" ON "income_recurrences"("user_id");

-- CreateIndex
CREATE INDEX "incomes_user_id_competence_idx" ON "incomes"("user_id", "competence");

-- CreateIndex
CREATE INDEX "incomes_recurrence_id_idx" ON "incomes"("recurrence_id");

-- AddForeignKey
ALTER TABLE "expense_recurrences" ADD CONSTRAINT "expense_recurrences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "installment_plans" ADD CONSTRAINT "installment_plans_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_recurrence_id_fkey" FOREIGN KEY ("recurrence_id") REFERENCES "expense_recurrences"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_installment_plan_id_fkey" FOREIGN KEY ("installment_plan_id") REFERENCES "installment_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "income_recurrences" ADD CONSTRAINT "income_recurrences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incomes" ADD CONSTRAINT "incomes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incomes" ADD CONSTRAINT "incomes_recurrence_id_fkey" FOREIGN KEY ("recurrence_id") REFERENCES "income_recurrences"("id") ON DELETE SET NULL ON UPDATE CASCADE;
