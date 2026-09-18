-- CreateTable
CREATE TABLE "expense_recurrence_exceptions" (
    "id" UUID NOT NULL,
    "recurrence_id" UUID NOT NULL,
    "competence" DATE NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "expense_recurrence_exceptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "expense_recurrence_exceptions_recurrence_id_idx" ON "expense_recurrence_exceptions"("recurrence_id");

-- CreateIndex
CREATE UNIQUE INDEX "expense_recurrence_exceptions_recurrence_id_competence_key" ON "expense_recurrence_exceptions"("recurrence_id", "competence");

-- AddForeignKey
ALTER TABLE "expense_recurrence_exceptions" ADD CONSTRAINT "expense_recurrence_exceptions_recurrence_id_fkey" FOREIGN KEY ("recurrence_id") REFERENCES "expense_recurrences"("id") ON DELETE CASCADE ON UPDATE CASCADE;
