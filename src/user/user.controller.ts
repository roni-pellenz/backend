import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { Authentication } from "@src/authentication/authentication.decorator";
import { AuthenticationGuard } from "@src/authentication/authentication.guard";
import type {
  AuthenticatedUser,
  AuthenticationContext
} from "@src/authentication/authentication.types";
import { CreateUserDto } from "@src/user/dto/create-user.dto";
import { UserService } from "@src/user/user.service";

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
  @UseGuards(AuthenticationGuard)
  me(@Authentication() authentication: AuthenticationContext): AuthenticatedUser {
    return authentication.user;
  }
}
