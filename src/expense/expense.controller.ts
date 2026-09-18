import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards
} from "@nestjs/common";
import { Authentication } from "@src/authentication/authentication.decorator";
import { AuthenticationGuard } from "@src/authentication/authentication.guard";
import type { AuthenticationContext } from "@src/authentication/authentication.types";
import { CreateExpenseDto } from "@src/expense/dto/create-expense.dto";
import { CreateInstallmentExpenseDto } from "@src/expense/dto/create-installment-expense.dto";
import { CreateRecurringExpenseDto } from "@src/expense/dto/create-recurring-expense.dto";
import { ListExpensesDto } from "@src/expense/dto/list-expenses.dto";
import { PayExpenseDto } from "@src/expense/dto/pay-expense.dto";
import { UpdateExpenseDto } from "@src/expense/dto/update-expense.dto";
import { UpdateRecurringExpenseDto } from "@src/expense/dto/update-recurring-expense.dto";
import { ExpenseService } from "@src/expense/expense.service";

@Controller("expenses")
@UseGuards(AuthenticationGuard)
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  @Post()
  create(@Authentication() authentication: AuthenticationContext, @Body() body: CreateExpenseDto) {
    return this.expenseService.create(authentication.user.id, body);
  }

  @Post("recurring")
  createRecurring(
    @Authentication() authentication: AuthenticationContext,
    @Body() body: CreateRecurringExpenseDto
  ) {
    return this.expenseService.createRecurring(authentication.user.id, body);
  }

  @Post("installments")
  createInstallments(
    @Authentication() authentication: AuthenticationContext,
    @Body() body: CreateInstallmentExpenseDto
  ) {
    return this.expenseService.createInstallments(authentication.user.id, body);
  }

  @Get()
  findByCompetence(
    @Authentication() authentication: AuthenticationContext,
    @Query() query: ListExpensesDto
  ) {
    return this.expenseService.findByCompetence(authentication.user.id, query.competence);
  }

  @Get(":id")
  findOne(
    @Authentication() authentication: AuthenticationContext,
    @Param("id", ParseUUIDPipe) expenseId: string
  ) {
    return this.expenseService.findOne(authentication.user.id, expenseId);
  }

  @Patch(":id/payment")
  pay(
    @Authentication() authentication: AuthenticationContext,
    @Param("id", ParseUUIDPipe) expenseId: string,
    @Body() body: PayExpenseDto
  ) {
    return this.expenseService.pay(authentication.user.id, expenseId, body);
  }

  @Delete(":id/payment")
  @HttpCode(HttpStatus.OK)
  unpay(
    @Authentication() authentication: AuthenticationContext,
    @Param("id", ParseUUIDPipe) expenseId: string
  ) {
    return this.expenseService.unpay(authentication.user.id, expenseId);
  }

  @Patch(":id/future")
  updateFuture(
    @Authentication() authentication: AuthenticationContext,
    @Param("id", ParseUUIDPipe) expenseId: string,
    @Body() body: UpdateRecurringExpenseDto
  ) {
    return this.expenseService.updateFuture(authentication.user.id, expenseId, body);
  }

  @Delete(":id/future")
  @HttpCode(HttpStatus.OK)
  async deleteFuture(
    @Authentication() authentication: AuthenticationContext,
    @Param("id", ParseUUIDPipe) expenseId: string
  ): Promise<{ success: true }> {
    await this.expenseService.deleteFuture(authentication.user.id, expenseId);

    return {
      success: true
    };
  }

  @Patch(":id")
  update(
    @Authentication() authentication: AuthenticationContext,
    @Param("id", ParseUUIDPipe) expenseId: string,
    @Body() body: UpdateExpenseDto
  ) {
    return this.expenseService.update(authentication.user.id, expenseId, body);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  async delete(
    @Authentication() authentication: AuthenticationContext,
    @Param("id", ParseUUIDPipe) expenseId: string
  ): Promise<{ success: true }> {
    await this.expenseService.delete(authentication.user.id, expenseId);

    return {
      success: true
    };
  }
}
