/*
  Warnings:

  - A unique constraint covering the columns `[recurrence_id,competence]` on the table `incomes` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "income_recurrence_exceptions" (
    "id" UUID NOT NULL,
    "recurrence_id" UUID NOT NULL,
    "competence" DATE NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "income_recurrence_exceptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "income_recurrence_exceptions_recurrence_id_idx" ON "income_recurrence_exceptions"("recurrence_id");

-- CreateIndex
CREATE UNIQUE INDEX "income_recurrence_exceptions_recurrence_id_competence_key" ON "income_recurrence_exceptions"("recurrence_id", "competence");

-- CreateIndex
CREATE UNIQUE INDEX "incomes_recurrence_id_competence_key" ON "incomes"("recurrence_id", "competence");

-- AddForeignKey
ALTER TABLE "income_recurrence_exceptions" ADD CONSTRAINT "income_recurrence_exceptions_recurrence_id_fkey" FOREIGN KEY ("recurrence_id") REFERENCES "income_recurrences"("id") ON DELETE CASCADE ON UPDATE CASCADE;
