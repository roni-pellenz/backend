import { Injectable } from "@nestjs/common";
import { ExpenseService } from "@src/expense/expense.service";
import { IncomeService } from "@src/income/income.service";

type IncomeSummaryItem = {
  amount: number;
  receivedDate: Date | null;
};

type ExpenseSummaryItem = {
  amount: number;
  paidDate: Date | null;
  paidAmount: number | null;
};

@Injectable()
export class PlanningService {
  constructor(
    private readonly incomeService: IncomeService,
    private readonly expenseService: ExpenseService
  ) {}

  async getMonthly(userId: string, competence: string) {
    const [incomes, expenses] = await Promise.all([
      this.incomeService.findByCompetence(userId, competence),
      this.expenseService.findByCompetence(userId, competence)
    ]);

    const incomeSummary = this.calculateIncomeSummary(incomes);
    const expenseSummary = this.calculateExpenseSummary(expenses);

    return {
      competence,
      incomes: incomeSummary,
      expenses: expenseSummary,
      balance: {
        plannedAmount: incomeSummary.plannedAmount - expenseSummary.plannedAmount,
        realizedAmount: incomeSummary.receivedAmount - expenseSummary.paidAmount,
        pendingIncomeAmount: incomeSummary.pendingAmount,
        pendingExpenseAmount: expenseSummary.pendingAmount
      },
      items: {
        incomes,
        expenses
      }
    };
  }

  async getProjection(userId: string, startCompetence: string, months: number) {
    const start = this.parseCompetence(startCompetence);
    const projection = [];

    for (let index = 0; index < months; index += 1) {
      const competence = this.formatCompetence(this.addMonths(start, index));

      const monthly = await this.getMonthly(userId, competence);

      projection.push({
        competence: monthly.competence,
        incomes: monthly.incomes,
        expenses: monthly.expenses,
        balance: monthly.balance
      });
    }

    return {
      startCompetence,
      months,
      projection
    };
  }

  private calculateIncomeSummary(incomes: IncomeSummaryItem[]) {
    const plannedAmount = incomes.reduce((total, income) => total + income.amount, 0);

    const received = incomes.filter((income) => income.receivedDate !== null);

    const pending = incomes.filter((income) => income.receivedDate === null);

    const receivedAmount = received.reduce((total, income) => total + income.amount, 0);

    const pendingAmount = pending.reduce((total, income) => total + income.amount, 0);

    return {
      plannedAmount,
      receivedAmount,
      pendingAmount,
      totalCount: incomes.length,
      receivedCount: received.length,
      pendingCount: pending.length
    };
  }

  private calculateExpenseSummary(expenses: ExpenseSummaryItem[]) {
    const plannedAmount = expenses.reduce((total, expense) => total + expense.amount, 0);

    const paid = expenses.filter((expense) => expense.paidDate !== null);

    const pending = expenses.filter((expense) => expense.paidDate === null);

    const paidAmount = paid.reduce(
      (total, expense) => total + (expense.paidAmount ?? expense.amount),
      0
    );

    const pendingAmount = pending.reduce((total, expense) => total + expense.amount, 0);

    const paidPlannedAmount = paid.reduce((total, expense) => total + expense.amount, 0);

    return {
      plannedAmount,
      paidAmount,
      pendingAmount,
      varianceAmount: paidAmount - paidPlannedAmount,
      totalCount: expenses.length,
      paidCount: paid.length,
      pendingCount: pending.length
    };
  }

  private parseCompetence(competence: string): Date {
    return new Date(`${competence}-01T00:00:00.000Z`);
  }

  private formatCompetence(date: Date): string {
    const year = date.getUTCFullYear();

    const month = String(date.getUTCMonth() + 1).padStart(2, "0");

    return `${year}-${month}`;
  }

  private addMonths(date: Date, months: number): Date {
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1));
  }
}
