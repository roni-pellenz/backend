/*
  Warnings:

  - A unique constraint covering the columns `[recurrence_id,competence]` on the table `expenses` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "expenses_recurrence_id_competence_key" ON "expenses"("recurrence_id", "competence");
