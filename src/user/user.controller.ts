import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  UseGuards
} from "@nestjs/common";
import { Authentication } from "@src/authentication/authentication.decorator";
import { AuthenticationGuard } from "@src/authentication/authentication.guard";
import type {
  AuthenticatedUser,
  AuthenticationContext
} from "@src/authentication/authentication.types";
import { CreateUserDto } from "@src/user/dto/create-user.dto";
import { DeleteUserDto } from "@src/user/dto/delete-user.dto";
import { UpdateUserDto } from "@src/user/dto/update-user.dto";
import { UserService } from "@src/user/user.service";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

@ApiTags("users")
@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() body: CreateUserDto): Promise<{
    id: string;
    name: string;
    surname: string;
    email: string;
    createdAt: Date;
  }> {
    return this.userService.create(body);
  }

  @Get("me")
  @ApiBearerAuth()
  @UseGuards(AuthenticationGuard)
  me(
    @Authentication()
    authentication: AuthenticationContext
  ): AuthenticatedUser {
    return authentication.user;
  }

  @Patch("me")
  @ApiBearerAuth()
  @UseGuards(AuthenticationGuard)
  update(
    @Authentication()
    authentication: AuthenticationContext,
    @Body() body: UpdateUserDto
  ): Promise<AuthenticatedUser> {
    return this.userService.update(authentication.user.id, body);
  }

  @Delete("me")
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthenticationGuard)
  async delete(
    @Authentication()
    authentication: AuthenticationContext,
    @Body() body: DeleteUserDto
  ): Promise<{ success: true }> {
    await this.userService.delete(authentication.user.id, body.password);

    return {
      success: true
    };
  }
}
