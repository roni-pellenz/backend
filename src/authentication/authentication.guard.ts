import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthenticatedRequest } from "@src/authentication/authentication.types";
import { SessionService } from "@src/session/session.service";

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(private readonly sessionService: SessionService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const authorization = request.headers.authorization;

    if (!authorization?.startsWith("Bearer ")) {
      throw new UnauthorizedException("Sessão inválida.");
    }

    const token = authorization.slice(7).trim();

    if (!token) {
      throw new UnauthorizedException("Sessão inválida.");
    }

    const session = await this.sessionService.findValid(token);

    if (!session) {
      throw new UnauthorizedException("Sessão inválida.");
    }

    request.authentication = {
      sessionId: session.id,
      user: {
        id: session.user.id,
        name: session.user.name,
        surname: session.user.surname,
        email: session.user.email
      }
    };

    return true;
  }
}
