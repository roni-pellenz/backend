import { ConflictException, Injectable } from "@nestjs/common";
import { hash } from "argon2";
import { DatabaseService } from "@src/database/database.service";
import { CreateUserDto } from "@src/user/dto/create-user.dto";

@Injectable()
export class UserService {
  constructor(private readonly database: DatabaseService) {}

  async create(data: CreateUserDto): Promise<{
    id: string;
    name: string;
    email: string;
    createdAt: Date;
  }> {
    const email = data.email.trim().toLowerCase();

    const existingUser = await this.database.user.findUnique({
      where: {
        email
      }
    });

    if (existingUser) {
      throw new ConflictException("Já existe um usuário com este e-mail.");
    }

    const passwordHash = await hash(data.password);

    const user = await this.database.user.create({
      data: {
        name: data.name.trim(),
        email,
        passwordHash
      }
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt
    };
  }
}
