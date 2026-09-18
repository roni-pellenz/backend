import { Body, Controller, Post } from "@nestjs/common";
import { AuthenticationService } from "@src/authentication/authentication.service";
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
}
