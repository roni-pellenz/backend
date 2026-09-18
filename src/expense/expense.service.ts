import { Injectable, NotFoundException } from "@nestjs/common";
import { DatabaseService } from "@src/database/database.service";
import { CreateExpenseDto } from "@src/expense/dto/create-expense.dto";

const expenseSelect = {
  id: true,
  name: true,
  amount: true,
  competence: true,
  dueDate: true,
  plannedPaymentDate: true,
  paidDate: true,
  paidAmount: true,
  createdAt: true,
  updatedAt: true
} as const;

@Injectable()
export class ExpenseService {
  constructor(private readonly database: DatabaseService) {}

  create(userId: string, data: CreateExpenseDto) {
    return this.database.expense.create({
      data: {
        userId,
        name: data.name.trim(),
        amount: data.amount,
        competence: this.parseCompetence(data.competence),
        dueDate: this.parseDate(data.dueDate),
        plannedPaymentDate: data.plannedPaymentDate ? this.parseDate(data.plannedPaymentDate) : null
      },
      select: expenseSelect
    });
  }

  findByCompetence(userId: string, competence: string) {
    return this.database.expense.findMany({
      where: {
        userId,
        competence: this.parseCompetence(competence)
      },
      orderBy: {
        dueDate: "asc"
      },
      select: expenseSelect
    });
  }

  async findOne(userId: string, expenseId: string) {
    const expense = await this.database.expense.findFirst({
      where: {
        id: expenseId,
        userId
      },
      select: expenseSelect
    });

    if (!expense) {
      throw new NotFoundException("Despesa não encontrada.");
    }

    return expense;
  }

  private parseCompetence(competence: string): Date {
    return new Date(`${competence}-01T00:00:00.000Z`);
  }

  private parseDate(date: string): Date {
    return new Date(`${date}T00:00:00.000Z`);
  }
}
