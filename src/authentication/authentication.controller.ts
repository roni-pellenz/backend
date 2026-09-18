import { Body, Controller, HttpCode, HttpStatus, Patch, Post, UseGuards } from "@nestjs/common";
import { Authentication } from "@src/authentication/authentication.decorator";
import { AuthenticationGuard } from "@src/authentication/authentication.guard";
import { AuthenticationService } from "@src/authentication/authentication.service";
import type { AuthenticationContext } from "@src/authentication/authentication.types";
import { ChangePasswordDto } from "@src/authentication/dto/change-password.dto";
import { LoginDto } from "@src/authentication/dto/login.dto";

@Controller("authentication")
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Post("login")
  login(@Body() body: LoginDto): Promise<{
    token: string;
    user: {
      id: string;
      name: string;
      surname: string;
      email: string;
    };
  }> {
    return this.authenticationService.login(body);
  }

  @Post("logout")
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthenticationGuard)
  async logout(
    @Authentication() authentication: AuthenticationContext
  ): Promise<{ success: true }> {
    await this.authenticationService.logout(authentication.sessionId);

    return {
      success: true
    };
  }

  @Patch("password")
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthenticationGuard)
  async changePassword(
    @Authentication() authentication: AuthenticationContext,
    @Body() body: ChangePasswordDto
  ): Promise<{ success: true }> {
    await this.authenticationService.changePassword(authentication.user.id, body);

    return {
      success: true
    };
  }
}
