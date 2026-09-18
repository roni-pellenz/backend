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
import { CreateIncomeDto } from "@src/income/dto/create-income.dto";
import { CreateRecurringIncomeDto } from "@src/income/dto/create-recurring-income.dto";
import { ListIncomesDto } from "@src/income/dto/list-incomes.dto";
import { ReceiveIncomeDto } from "@src/income/dto/receive-income.dto";
import { UpdateIncomeDto } from "@src/income/dto/update-income.dto";
import { UpdateRecurringIncomeDto } from "@src/income/dto/update-recurring-income.dto";
import { IncomeService } from "@src/income/income.service";

@Controller("incomes")
@UseGuards(AuthenticationGuard)
export class IncomeController {
  constructor(private readonly incomeService: IncomeService) {}

  @Post()
  create(@Authentication() authentication: AuthenticationContext, @Body() body: CreateIncomeDto) {
    return this.incomeService.create(authentication.user.id, body);
  }

  @Post("recurring")
  createRecurring(
    @Authentication() authentication: AuthenticationContext,
    @Body() body: CreateRecurringIncomeDto
  ) {
    return this.incomeService.createRecurring(authentication.user.id, body);
  }

  @Get()
  findByCompetence(
    @Authentication() authentication: AuthenticationContext,
    @Query() query: ListIncomesDto
  ) {
    return this.incomeService.findByCompetence(authentication.user.id, query.competence);
  }

  @Get(":id")
  findOne(
    @Authentication() authentication: AuthenticationContext,
    @Param("id", ParseUUIDPipe) incomeId: string
  ) {
    return this.incomeService.findOne(authentication.user.id, incomeId);
  }

  @Patch(":id/receipt")
  receive(
    @Authentication() authentication: AuthenticationContext,
    @Param("id", ParseUUIDPipe) incomeId: string,
    @Body() body: ReceiveIncomeDto
  ) {
    return this.incomeService.receive(authentication.user.id, incomeId, body);
  }

  @Delete(":id/receipt")
  @HttpCode(HttpStatus.OK)
  unreceive(
    @Authentication() authentication: AuthenticationContext,
    @Param("id", ParseUUIDPipe) incomeId: string
  ) {
    return this.incomeService.unreceive(authentication.user.id, incomeId);
  }

  @Patch(":id/future")
  updateFuture(
    @Authentication() authentication: AuthenticationContext,
    @Param("id", ParseUUIDPipe) incomeId: string,
    @Body() body: UpdateRecurringIncomeDto
  ) {
    return this.incomeService.updateFuture(authentication.user.id, incomeId, body);
  }

  @Delete(":id/future")
  @HttpCode(HttpStatus.OK)
  async deleteFuture(
    @Authentication() authentication: AuthenticationContext,
    @Param("id", ParseUUIDPipe) incomeId: string
  ): Promise<{ success: true }> {
    await this.incomeService.deleteFuture(authentication.user.id, incomeId);

    return {
      success: true
    };
  }

  @Patch(":id")
  update(
    @Authentication() authentication: AuthenticationContext,
    @Param("id", ParseUUIDPipe) incomeId: string,
    @Body() body: UpdateIncomeDto
  ) {
    return this.incomeService.update(authentication.user.id, incomeId, body);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  async delete(
    @Authentication() authentication: AuthenticationContext,
    @Param("id", ParseUUIDPipe) incomeId: string
  ): Promise<{ success: true }> {
    await this.incomeService.delete(authentication.user.id, incomeId);

    return {
      success: true
    };
  }
}
