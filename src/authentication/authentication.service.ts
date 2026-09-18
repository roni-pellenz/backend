import { Injectable, UnauthorizedException } from "@nestjs/common";
import { hash, verify } from "argon2";
import { DatabaseService } from "@src/database/database.service";
import { ChangePasswordDto } from "@src/authentication/dto/change-password.dto";
import { LoginDto } from "@src/authentication/dto/login.dto";
import { SessionService } from "@src/session/session.service";

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly database: DatabaseService,
    private readonly sessionService: SessionService
  ) {}

  async login(data: LoginDto): Promise<{
    token: string;
    user: {
      id: string;
      name: string;
      surname: string;
      email: string;
    };
  }> {
    const email = data.email.trim().toLowerCase();

    const user = await this.database.user.findUnique({
      where: {
        email
      }
    });

    if (!user) {
      throw new UnauthorizedException("E-mail ou senha inválidos.");
    }

    const passwordIsValid = await verify(user.passwordHash, data.password);

    if (!passwordIsValid) {
      throw new UnauthorizedException("E-mail ou senha inválidos.");
    }

    const token = await this.sessionService.create(user.id);

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        surname: user.surname,
        email: user.email
      }
    };
  }

  async logout(sessionId: string): Promise<void> {
    await this.sessionService.revoke(sessionId);
  }

  async changePassword(userId: string, data: ChangePasswordDto): Promise<void> {
    const user = await this.database.user.findUnique({
      where: {
        id: userId
      }
    });

    if (!user) {
      throw new UnauthorizedException("Usuário não encontrado.");
    }

    const passwordIsValid = await verify(user.passwordHash, data.currentPassword);

    if (!passwordIsValid) {
      throw new UnauthorizedException("Senha atual inválida.");
    }

    const passwordHash = await hash(data.newPassword);
    const now = new Date();

    await this.database.$transaction([
      this.database.user.update({
        where: {
          id: userId
        },
        data: {
          passwordHash
        }
      }),
      this.database.session.updateMany({
        where: {
          userId,
          revokedAt: null
        },
        data: {
          revokedAt: now
        }
      })
    ]);
  }
}
