import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { DatabaseService } from "@src/database/database.service";
import { CreateIncomeDto } from "@src/income/dto/create-income.dto";
import { CreateRecurringIncomeDto } from "@src/income/dto/create-recurring-income.dto";
import { ReceiveIncomeDto } from "@src/income/dto/receive-income.dto";
import { UpdateIncomeDto } from "@src/income/dto/update-income.dto";
import { UpdateRecurringIncomeDto } from "@src/income/dto/update-recurring-income.dto";

const incomeSelect = {
  id: true,
  recurrenceId: true,
  name: true,
  amount: true,
  competence: true,
  expectedDate: true,
  receivedDate: true,
  createdAt: true,
  updatedAt: true
} as const;

const incomeDetailSelect = {
  ...incomeSelect,
  recurrence: {
    select: {
      id: true,
      name: true,
      amount: true,
      frequency: true,
      receiptDay: true,
      startCompetence: true,
      endCompetence: true,
      createdAt: true,
      updatedAt: true
    }
  }
} as const;

@Injectable()
export class IncomeService {
  constructor(private readonly database: DatabaseService) {}

  create(userId: string, data: CreateIncomeDto) {
    return this.database.income.create({
      data: {
        userId,
        name: data.name.trim(),
        amount: data.amount,
        competence: this.parseCompetence(data.competence),
        expectedDate: this.parseDate(data.expectedDate)
      },
      select: incomeSelect
    });
  }

  async createRecurring(userId: string, data: CreateRecurringIncomeDto) {
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
      const recurrence = await transaction.incomeRecurrence.create({
        data: {
          userId,
          name: data.name.trim(),
          amount: data.amount,
          frequency: "MONTHLY",
          receiptDay: data.receiptDay,
          startCompetence,
          endCompetence
        }
      });

      await transaction.income.createMany({
        data: competences.map((competence) => ({
          userId,
          recurrenceId: recurrence.id,
          name: data.name.trim(),
          amount: data.amount,
          competence,
          expectedDate: this.createDateForDay(competence, data.receiptDay)
        }))
      });

      const incomes = await transaction.income.findMany({
        where: {
          recurrenceId: recurrence.id
        },
        orderBy: {
          competence: "asc"
        },
        select: incomeSelect
      });

      return {
        recurrence: {
          id: recurrence.id,
          name: recurrence.name,
          amount: recurrence.amount,
          frequency: recurrence.frequency,
          receiptDay: recurrence.receiptDay,
          startCompetence: recurrence.startCompetence,
          endCompetence: recurrence.endCompetence
        },
        incomes
      };
    });
  }

  async findByCompetence(userId: string, competence: string) {
    const parsedCompetence = this.parseCompetence(competence);

    await this.ensureRecurringIncomesForCompetence(userId, parsedCompetence);

    return this.database.income.findMany({
      where: {
        userId,
        competence: parsedCompetence
      },
      orderBy: {
        expectedDate: "asc"
      },
      select: incomeSelect
    });
  }

  async findOne(userId: string, incomeId: string) {
    const income = await this.database.income.findFirst({
      where: {
        id: incomeId,
        userId
      },
      select: incomeDetailSelect
    });

    if (!income) {
      throw new NotFoundException("Receita não encontrada.");
    }

    return income;
  }

  async update(userId: string, incomeId: string, data: UpdateIncomeDto) {
    await this.ensureExists(userId, incomeId);

    return this.database.income.update({
      where: {
        id: incomeId
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
        ...(data.expectedDate !== undefined && {
          expectedDate: this.parseDate(data.expectedDate)
        })
      },
      select: incomeSelect
    });
  }

  async updateFuture(userId: string, incomeId: string, data: UpdateRecurringIncomeDto) {
    const selectedIncome = await this.database.income.findFirst({
      where: {
        id: incomeId,
        userId
      },
      include: {
        recurrence: true
      }
    });

    if (!selectedIncome) {
      throw new NotFoundException("Receita não encontrada.");
    }

    if (!selectedIncome.recurrence || !selectedIncome.recurrenceId) {
      throw new BadRequestException("A receita não pertence a uma recorrência.");
    }

    const hasEndCompetence = Object.prototype.hasOwnProperty.call(data, "endCompetence");

    if (
      data.name === undefined &&
      data.amount === undefined &&
      data.receiptDay === undefined &&
      !hasEndCompetence
    ) {
      throw new BadRequestException("Nenhuma alteração foi informada.");
    }

    const recurrence = selectedIncome.recurrence;

    const parsedEndCompetence = hasEndCompetence
      ? data.endCompetence === null
        ? null
        : this.parseCompetence(data.endCompetence as string)
      : undefined;

    if (parsedEndCompetence && parsedEndCompetence < selectedIncome.competence) {
      throw new BadRequestException(
        "A competência final não pode ser anterior à receita selecionada."
      );
    }

    return this.database.$transaction(async (transaction) => {
      let targetRecurrenceId = recurrence.id;

      const effectiveEndCompetence = hasEndCompetence
        ? (parsedEndCompetence ?? null)
        : recurrence.endCompetence;

      if (selectedIncome.competence > recurrence.startCompetence) {
        const previousCompetence = this.addMonths(selectedIncome.competence, -1);

        await transaction.incomeRecurrence.update({
          where: {
            id: recurrence.id
          },
          data: {
            endCompetence: previousCompetence
          }
        });

        const newRecurrence = await transaction.incomeRecurrence.create({
          data: {
            userId,
            name: data.name?.trim() ?? recurrence.name,
            amount: data.amount ?? recurrence.amount,
            frequency: recurrence.frequency,
            receiptDay: data.receiptDay ?? recurrence.receiptDay,
            startCompetence: selectedIncome.competence,
            endCompetence: effectiveEndCompetence
          }
        });

        targetRecurrenceId = newRecurrence.id;

        await transaction.incomeRecurrenceException.updateMany({
          where: {
            recurrenceId: recurrence.id,
            competence: {
              gte: selectedIncome.competence
            }
          },
          data: {
            recurrenceId: newRecurrence.id
          }
        });
      } else {
        await transaction.incomeRecurrence.update({
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
            ...(data.receiptDay !== undefined && {
              receiptDay: data.receiptDay
            }),
            ...(hasEndCompetence && {
              endCompetence: effectiveEndCompetence
            })
          }
        });
      }

      const futureIncomes = await transaction.income.findMany({
        where: {
          userId,
          recurrenceId: recurrence.id,
          competence: {
            gte: selectedIncome.competence
          }
        },
        orderBy: {
          competence: "asc"
        }
      });

      for (const income of futureIncomes) {
        if (effectiveEndCompetence && income.competence > effectiveEndCompetence) {
          await transaction.income.delete({
            where: {
              id: income.id
            }
          });

          continue;
        }

        await transaction.income.update({
          where: {
            id: income.id
          },
          data: {
            recurrenceId: targetRecurrenceId,
            ...(data.name !== undefined && {
              name: data.name.trim()
            }),
            ...(data.amount !== undefined && {
              amount: data.amount
            }),
            ...(data.receiptDay !== undefined && {
              expectedDate: this.createDateForDay(income.competence, data.receiptDay)
            })
          }
        });
      }

      if (effectiveEndCompetence) {
        await transaction.incomeRecurrenceException.deleteMany({
          where: {
            recurrenceId: targetRecurrenceId,
            competence: {
              gt: effectiveEndCompetence
            }
          }
        });
      }

      const updatedRecurrence = await transaction.incomeRecurrence.findUnique({
        where: {
          id: targetRecurrenceId
        }
      });

      const updatedIncomes = await transaction.income.findMany({
        where: {
          recurrenceId: targetRecurrenceId
        },
        orderBy: {
          competence: "asc"
        },
        select: incomeSelect
      });

      return {
        recurrence: updatedRecurrence,
        incomes: updatedIncomes
      };
    });
  }

  async receive(userId: string, incomeId: string, data: ReceiveIncomeDto) {
    await this.ensureExists(userId, incomeId);

    return this.database.income.update({
      where: {
        id: incomeId
      },
      data: {
        receivedDate: this.parseDate(data.receivedDate)
      },
      select: incomeSelect
    });
  }

  async unreceive(userId: string, incomeId: string) {
    await this.ensureExists(userId, incomeId);

    return this.database.income.update({
      where: {
        id: incomeId
      },
      data: {
        receivedDate: null
      },
      select: incomeSelect
    });
  }

  async deleteFuture(userId: string, incomeId: string): Promise<void> {
    const selectedIncome = await this.database.income.findFirst({
      where: {
        id: incomeId,
        userId
      },
      include: {
        recurrence: true
      }
    });

    if (!selectedIncome) {
      throw new NotFoundException("Receita não encontrada.");
    }

    if (!selectedIncome.recurrence || !selectedIncome.recurrenceId) {
      throw new BadRequestException("A receita não pertence a uma recorrência.");
    }

    const recurrence = selectedIncome.recurrence;

    await this.database.$transaction(async (transaction) => {
      await transaction.income.deleteMany({
        where: {
          userId,
          recurrenceId: recurrence.id,
          competence: {
            gte: selectedIncome.competence
          }
        }
      });

      await transaction.incomeRecurrenceException.deleteMany({
        where: {
          recurrenceId: recurrence.id,
          competence: {
            gte: selectedIncome.competence
          }
        }
      });

      if (selectedIncome.competence <= recurrence.startCompetence) {
        await transaction.incomeRecurrence.delete({
          where: {
            id: recurrence.id
          }
        });

        return;
      }

      await transaction.incomeRecurrence.update({
        where: {
          id: recurrence.id
        },
        data: {
          endCompetence: this.addMonths(selectedIncome.competence, -1)
        }
      });
    });
  }

  async delete(userId: string, incomeId: string): Promise<void> {
    const income = await this.database.income.findFirst({
      where: {
        id: incomeId,
        userId
      },
      select: {
        id: true,
        recurrenceId: true,
        competence: true
      }
    });

    if (!income) {
      throw new NotFoundException("Receita não encontrada.");
    }

    await this.database.$transaction(async (transaction) => {
      if (income.recurrenceId) {
        await transaction.incomeRecurrenceException.upsert({
          where: {
            recurrenceId_competence: {
              recurrenceId: income.recurrenceId,
              competence: income.competence
            }
          },
          update: {},
          create: {
            recurrenceId: income.recurrenceId,
            competence: income.competence
          }
        });
      }

      await transaction.income.delete({
        where: {
          id: income.id
        }
      });
    });
  }

  private async ensureRecurringIncomesForCompetence(
    userId: string,
    competence: Date
  ): Promise<void> {
    const recurrences = await this.database.incomeRecurrence.findMany({
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
      await this.database.income.upsert({
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
          expectedDate: this.createDateForDay(competence, recurrence.receiptDay)
        }
      });
    }
  }

  private async ensureExists(userId: string, incomeId: string): Promise<void> {
    const income = await this.database.income.findFirst({
      where: {
        id: incomeId,
        userId
      },
      select: {
        id: true
      }
    });

    if (!income) {
      throw new NotFoundException("Receita não encontrada.");
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
}
