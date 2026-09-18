import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards
} from "@nestjs/common";
import { Authentication } from "@src/authentication/authentication.decorator";
import { AuthenticationGuard } from "@src/authentication/authentication.guard";
import type { AuthenticationContext } from "@src/authentication/authentication.types";
import { CreateExpenseDto } from "@src/expense/dto/create-expense.dto";
import { ListExpensesDto } from "@src/expense/dto/list-expenses.dto";
import { UpdateExpenseDto } from "@src/expense/dto/update-expense.dto";
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

  @Patch(":id")
  update(
    @Authentication() authentication: AuthenticationContext,
    @Param("id") expenseId: string,
    @Body() body: UpdateExpenseDto
  ) {
    return this.expenseService.update(authentication.user.id, expenseId, body);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  async delete(
    @Authentication() authentication: AuthenticationContext,
    @Param("id") expenseId: string
  ): Promise<{ success: true }> {
    await this.expenseService.delete(authentication.user.id, expenseId);

    return {
      success: true
    };
  }
}
