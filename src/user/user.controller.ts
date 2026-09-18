import { Body, Controller, Post } from "@nestjs/common";
import { CreateUserDto } from "@src/user/dto/create-user.dto";
import { UserService } from "@src/user/user.service";

@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() body: CreateUserDto): Promise<{
    id: string;
    name: string;
    email: string;
    createdAt: Date;
  }> {
    return this.userService.create(body);
  }
}
