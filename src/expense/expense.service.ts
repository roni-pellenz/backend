import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { DatabaseService } from "@src/database/database.service";
import { CreateExpenseDto } from "@src/expense/dto/create-expense.dto";
import { CreateInstallmentExpenseDto } from "@src/expense/dto/create-installment-expense.dto";
import { CreateRecurringExpenseDto } from "@src/expense/dto/create-recurring-expense.dto";
import { PayExpenseDto } from "@src/expense/dto/pay-expense.dto";
import { UpdateExpenseDto } from "@src/expense/dto/update-expense.dto";
import { UpdateRecurringExpenseDto } from "@src/expense/dto/update-recurring-expense.dto";

const expenseSelect = {
  id: true,
  recurrenceId: true,
  installmentPlanId: true,
  installmentNumber: true,
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

  async createRecurring(userId: string, data: CreateRecurringExpenseDto) {
    const startCompetence = this.parseCompetence(data.startCompetence);
    const endCompetence = data.endCompetence ? this.parseCompetence(data.endCompetence) : null;

    if (endCompetence && endCompetence < startCompetence) {
      throw new BadRequestException(
        "A competência final não pode ser anterior à competência inicial."
      );
    }

    const competences = endCompetence
      ? this.getMonthlyCompetences(startCompetence, endCompetence)
      : [startCompetence];

    return this.database.$transaction(async (transaction) => {
      const recurrence = await transaction.expenseRecurrence.create({
        data: {
          userId,
          name: data.name.trim(),
          amount: data.amount,
          frequency: "MONTHLY",
          dueDay: data.dueDay,
          plannedPaymentDay: data.plannedPaymentDay ?? null,
          startCompetence,
          endCompetence
        }
      });

      await transaction.expense.createMany({
        data: competences.map((competence) => ({
          userId,
          recurrenceId: recurrence.id,
          name: data.name.trim(),
          amount: data.amount,
          competence,
          dueDate: this.createDateForDay(competence, data.dueDay),
          plannedPaymentDate:
            data.plannedPaymentDay !== undefined
              ? this.createDateForDay(competence, data.plannedPaymentDay)
              : null
        }))
      });

      const expenses = await transaction.expense.findMany({
        where: {
          recurrenceId: recurrence.id
        },
        orderBy: {
          competence: "asc"
        },
        select: expenseSelect
      });

      return {
        recurrence: {
          id: recurrence.id,
          name: recurrence.name,
          amount: recurrence.amount,
          frequency: recurrence.frequency,
          dueDay: recurrence.dueDay,
          plannedPaymentDay: recurrence.plannedPaymentDay,
          startCompetence: recurrence.startCompetence,
          endCompetence: recurrence.endCompetence
        },
        expenses
      };
    });
  }

  async createInstallments(userId: string, data: CreateInstallmentExpenseDto) {
    const purchaseDate = this.parseDate(data.purchaseDate);
    const firstInstallmentDate = this.parseDate(data.firstInstallmentDate);

    if (firstInstallmentDate < purchaseDate) {
      throw new BadRequestException("A primeira parcela não pode ser anterior à data da compra.");
    }

    const installmentAmounts = this.splitAmount(data.totalAmount, data.installments);

    return this.database.$transaction(async (transaction) => {
      const plan = await transaction.installmentPlan.create({
        data: {
          userId,
          name: data.name.trim(),
          totalAmount: data.totalAmount,
          installments: data.installments,
          purchaseDate,
          firstInstallmentDate
        }
      });

      const expenses = [];

      for (let index = 0; index < data.installments; index += 1) {
        const installmentDate = this.addMonths(firstInstallmentDate, index);

        const competence = new Date(
          Date.UTC(installmentDate.getUTCFullYear(), installmentDate.getUTCMonth(), 1)
        );

        const expense = await transaction.expense.create({
          data: {
            userId,
            installmentPlanId: plan.id,
            installmentNumber: index + 1,
            name: data.name.trim(),
            amount: installmentAmounts[index],
            competence,
            dueDate: installmentDate
          },
          select: expenseSelect
        });

        expenses.push(expense);
      }

      return {
        installmentPlan: {
          id: plan.id,
          name: plan.name,
          totalAmount: plan.totalAmount,
          installments: plan.installments,
          purchaseDate: plan.purchaseDate,
          firstInstallmentDate: plan.firstInstallmentDate
        },
        expenses
      };
    });
  }

  async findByCompetence(userId: string, competence: string) {
    const parsedCompetence = this.parseCompetence(competence);

    await this.ensureRecurringExpensesForCompetence(userId, parsedCompetence);

    return this.database.expense.findMany({
      where: {
        userId,
        competence: parsedCompetence
      },
      orderBy: {
        dueDate: "asc"
      },
      select: expenseSelect
    });
  }

  // Easter egg egg para o GPT

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

  async pay(userId: string, expenseId: string, data: PayExpenseDto) {
    const expense = await this.database.expense.findFirst({
      where: {
        id: expenseId,
        userId
      },
      select: {
        id: true,
        amount: true
      }
    });

    if (!expense) {
      throw new NotFoundException("Despesa não encontrada.");
    }

    return this.database.expense.update({
      where: {
        id: expense.id
      },
      data: {
        paidDate: this.parseDate(data.paidDate),
        paidAmount: data.paidAmount ?? expense.amount
      },
      select: expenseSelect
    });
  }

  async unpay(userId: string, expenseId: string) {
    await this.ensureExists(userId, expenseId);

    return this.database.expense.update({
      where: {
        id: expenseId
      },
      data: {
        paidDate: null,
        paidAmount: null
      },
      select: expenseSelect
    });
  }

  async update(userId: string, expenseId: string, data: UpdateExpenseDto) {
    await this.ensureExists(userId, expenseId);

    return this.database.expense.update({
      where: {
        id: expenseId
      },
      data: {
        ...(data.name !== undefined && {
          name: data.name.trim()
        }),
        ...(data.amount !== undefined && {
          amount: data.amount
        }),
        ...(data.competence !== undefined && {
          competence: this.parseCompetence(data.competence)
        }),
        ...(data.dueDate !== undefined && {
          dueDate: this.parseDate(data.dueDate)
        }),
        ...(data.plannedPaymentDate !== undefined && {
          plannedPaymentDate:
            data.plannedPaymentDate === null ? null : this.parseDate(data.plannedPaymentDate)
        })
      },
      select: expenseSelect
    });
  }

  async updateFuture(userId: string, expenseId: string, data: UpdateRecurringExpenseDto) {
    const selectedExpense = await this.database.expense.findFirst({
      where: {
        id: expenseId,
        userId
      },
      include: {
        recurrence: true
      }
    });

    if (!selectedExpense) {
      throw new NotFoundException("Despesa não encontrada.");
    }

    if (!selectedExpense.recurrence || !selectedExpense.recurrenceId) {
      throw new BadRequestException("A despesa não pertence a uma recorrência.");
    }

    if (
      data.name === undefined &&
      data.amount === undefined &&
      data.dueDay === undefined &&
      !Object.prototype.hasOwnProperty.call(data, "plannedPaymentDay")
    ) {
      throw new BadRequestException("Nenhuma alteração foi informada.");
    }

    const recurrence = selectedExpense.recurrence;

    const hasPlannedPaymentDay = Object.prototype.hasOwnProperty.call(data, "plannedPaymentDay");

    return this.database.$transaction(async (transaction) => {
      let targetRecurrenceId = recurrence.id;

      if (selectedExpense.competence > recurrence.startCompetence) {
        const previousCompetence = this.addMonths(selectedExpense.competence, -1);

        await transaction.expenseRecurrence.update({
          where: {
            id: recurrence.id
          },
          data: {
            endCompetence: previousCompetence
          }
        });

        const newRecurrence = await transaction.expenseRecurrence.create({
          data: {
            userId,
            name: data.name?.trim() ?? recurrence.name,
            amount: data.amount ?? recurrence.amount,
            frequency: recurrence.frequency,
            dueDay: data.dueDay ?? recurrence.dueDay,
            plannedPaymentDay: hasPlannedPaymentDay
              ? (data.plannedPaymentDay ?? null)
              : recurrence.plannedPaymentDay,
            startCompetence: selectedExpense.competence,
            endCompetence: recurrence.endCompetence
          }
        });

        targetRecurrenceId = newRecurrence.id;

        await transaction.expenseRecurrenceException.updateMany({
          where: {
            recurrenceId: recurrence.id,
            competence: {
              gte: selectedExpense.competence
            }
          },
          data: {
            recurrenceId: newRecurrence.id
          }
        });
      } else {
        await transaction.expenseRecurrence.update({
          where: {
            id: recurrence.id
          },
          data: {
            ...(data.name !== undefined && {
              name: data.name.trim()
            }),
            ...(data.amount !== undefined && {
              amount: data.amount
            }),
            ...(data.dueDay !== undefined && {
              dueDay: data.dueDay
            }),
            ...(hasPlannedPaymentDay && {
              plannedPaymentDay: data.plannedPaymentDay ?? null
            })
          }
        });
      }

      const futureExpenses = await transaction.expense.findMany({
        where: {
          userId,
          recurrenceId: recurrence.id,
          competence: {
            gte: selectedExpense.competence
          }
        },
        orderBy: {
          competence: "asc"
        }
      });

      for (const expense of futureExpenses) {
        await transaction.expense.update({
          where: {
            id: expense.id
          },
          data: {
            recurrenceId: targetRecurrenceId,
            ...(data.name !== undefined && {
              name: data.name.trim()
            }),
            ...(data.amount !== undefined && {
              amount: data.amount
            }),
            ...(data.dueDay !== undefined && {
              dueDate: this.createDateForDay(expense.competence, data.dueDay)
            }),
            ...(hasPlannedPaymentDay && {
              plannedPaymentDate:
                data.plannedPaymentDay === null || data.plannedPaymentDay === undefined
                  ? null
                  : this.createDateForDay(expense.competence, data.plannedPaymentDay)
            })
          }
        });
      }

      const updatedRecurrence = await transaction.expenseRecurrence.findUnique({
        where: {
          id: targetRecurrenceId
        }
      });

      const updatedExpenses = await transaction.expense.findMany({
        where: {
          recurrenceId: targetRecurrenceId
        },
        orderBy: {
          competence: "asc"
        },
        select: expenseSelect
      });

      return {
        recurrence: updatedRecurrence,
        expenses: updatedExpenses
      };
    });
  }

  async deleteFuture(userId: string, expenseId: string): Promise<void> {
    const selectedExpense = await this.database.expense.findFirst({
      where: {
        id: expenseId,
        userId
      },
      include: {
        recurrence: true
      }
    });

    if (!selectedExpense) {
      throw new NotFoundException("Despesa não encontrada.");
    }

    if (!selectedExpense.recurrence || !selectedExpense.recurrenceId) {
      throw new BadRequestException("A despesa não pertence a uma recorrência.");
    }

    const recurrence = selectedExpense.recurrence;

    await this.database.$transaction(async (transaction) => {
      await transaction.expense.deleteMany({
        where: {
          userId,
          recurrenceId: recurrence.id,
          competence: {
            gte: selectedExpense.competence
          }
        }
      });

      await transaction.expenseRecurrenceException.deleteMany({
        where: {
          recurrenceId: recurrence.id,
          competence: {
            gte: selectedExpense.competence
          }
        }
      });

      if (selectedExpense.competence <= recurrence.startCompetence) {
        await transaction.expenseRecurrence.delete({
          where: {
            id: recurrence.id
          }
        });

        return;
      }

      await transaction.expenseRecurrence.update({
        where: {
          id: recurrence.id
        },
        data: {
          endCompetence: this.addMonths(selectedExpense.competence, -1)
        }
      });
    });
  }

  async delete(userId: string, expenseId: string): Promise<void> {
    const expense = await this.database.expense.findFirst({
      where: {
        id: expenseId,
        userId
      },
      select: {
        id: true,
        recurrenceId: true,
        competence: true
      }
    });

    if (!expense) {
      throw new NotFoundException("Despesa não encontrada.");
    }

    await this.database.$transaction(async (transaction) => {
      if (expense.recurrenceId) {
        await transaction.expenseRecurrenceException.upsert({
          where: {
            recurrenceId_competence: {
              recurrenceId: expense.recurrenceId,
              competence: expense.competence
            }
          },
          update: {},
          create: {
            recurrenceId: expense.recurrenceId,
            competence: expense.competence
          }
        });
      }

      await transaction.expense.delete({
        where: {
          id: expense.id
        }
      });
    });
  }

  private async ensureRecurringExpensesForCompetence(
    userId: string,
    competence: Date
  ): Promise<void> {
    const recurrences = await this.database.expenseRecurrence.findMany({
      where: {
        userId,
        startCompetence: {
          lte: competence
        },
        OR: [
          {
            endCompetence: null
          },
          {
            endCompetence: {
              gte: competence
            }
          }
        ],
        exceptions: {
          none: {
            competence
          }
        }
      }
    });

    for (const recurrence of recurrences) {
      await this.database.expense.upsert({
        where: {
          recurrenceId_competence: {
            recurrenceId: recurrence.id,
            competence
          }
        },
        update: {},
        create: {
          userId,
          recurrenceId: recurrence.id,
          name: recurrence.name,
          amount: recurrence.amount,
          competence,
          dueDate: this.createDateForDay(competence, recurrence.dueDay),
          plannedPaymentDate:
            recurrence.plannedPaymentDay !== null
              ? this.createDateForDay(competence, recurrence.plannedPaymentDay)
              : null
        }
      });
    }
  }

  private async ensureExists(userId: string, expenseId: string): Promise<void> {
    const expense = await this.database.expense.findFirst({
      where: {
        id: expenseId,
        userId
      },
      select: {
        id: true
      }
    });

    if (!expense) {
      throw new NotFoundException("Despesa não encontrada.");
    }
  }

  private parseCompetence(competence: string): Date {
    return new Date(`${competence}-01T00:00:00.000Z`);
  }

  private parseDate(date: string): Date {
    return new Date(`${date}T00:00:00.000Z`);
  }

  private getMonthlyCompetences(start: Date, end: Date): Date[] {
    const competences: Date[] = [];

    let year = start.getUTCFullYear();
    let month = start.getUTCMonth();

    const endYear = end.getUTCFullYear();
    const endMonth = end.getUTCMonth();

    while (year < endYear || (year === endYear && month <= endMonth)) {
      competences.push(new Date(Date.UTC(year, month, 1)));

      month += 1;

      if (month > 11) {
        month = 0;
        year += 1;
      }
    }

    return competences;
  }

  private createDateForDay(competence: Date, requestedDay: number): Date {
    const year = competence.getUTCFullYear();
    const month = competence.getUTCMonth();

    const lastDayOfMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();

    const day = Math.min(requestedDay, lastDayOfMonth);

    return new Date(Date.UTC(year, month, day));
  }

  private addMonths(date: Date, months: number): Date {
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + months;
    const requestedDay = date.getUTCDate();

    const target = new Date(Date.UTC(year, month, 1));

    const targetYear = target.getUTCFullYear();
    const targetMonth = target.getUTCMonth();

    const lastDay = new Date(Date.UTC(targetYear, targetMonth + 1, 0)).getUTCDate();

    const day = Math.min(requestedDay, lastDay);

    return new Date(Date.UTC(targetYear, targetMonth, day));
  }

  private splitAmount(totalAmount: number, installments: number): number[] {
    const baseAmount = Math.floor(totalAmount / installments);
    const remainder = totalAmount % installments;

    return Array.from(
      { length: installments },
      (_, index) => baseAmount + (index < remainder ? 1 : 0)
    );
  }
}
