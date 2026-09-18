import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { hash, verify } from "argon2";
import { DatabaseService } from "@src/database/database.service";
import { CreateUserDto } from "@src/user/dto/create-user.dto";

@Injectable()
export class UserService {
  constructor(private readonly database: DatabaseService) {}

  async create(data: CreateUserDto): Promise<{
    id: string;
    name: string;
    surname: string;
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
        surname: data.surname.trim(),
        email,
        passwordHash
      }
    });

    return {
      id: user.id,
      name: user.name,
      surname: user.surname,
      email: user.email,
      createdAt: user.createdAt
    };
  }

  async delete(userId: string, password: string): Promise<void> {
    const user = await this.database.user.findUnique({
      where: {
        id: userId
      }
    });

    if (!user) {
      throw new UnauthorizedException("Usuário não encontrado.");
    }

    const passwordIsValid = await verify(user.passwordHash, password);

    if (!passwordIsValid) {
      throw new UnauthorizedException("Senha inválida.");
    }

    await this.database.user.delete({
      where: {
        id: userId
      }
    });
  }
}
