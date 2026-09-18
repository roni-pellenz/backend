import { Body, Controller, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { Authentication } from "@src/authentication/authentication.decorator";
import { AuthenticationGuard } from "@src/authentication/authentication.guard";
import type { AuthenticationContext } from "@src/authentication/authentication.types";
import { CreateExpenseDto } from "@src/expense/dto/create-expense.dto";
import { ListExpensesDto } from "@src/expense/dto/list-expenses.dto";
import { ExpenseService } from "@src/expense/expense.service";

@Controller("expenses")
@UseGuards(AuthenticationGuard)
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  @Post()
  create(@Authentication() authentication: AuthenticationContext, @Body() body: CreateExpenseDto) {
    return this.expenseService.create(authentication.user.id, body);
  }

  @Get()
  findByCompetence(
    @Authentication() authentication: AuthenticationContext,
    @Query() query: ListExpensesDto
  ) {
    return this.expenseService.findByCompetence(authentication.user.id, query.competence);
  }

  @Get(":id")
  findOne(@Authentication() authentication: AuthenticationContext, @Param("id") expenseId: string) {
    return this.expenseService.findOne(authentication.user.id, expenseId);
  }
}
