import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import {
  AuthenticatedRequest,
  AuthenticationContext
} from "@src/authentication/authentication.types";

export const Authentication = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthenticationContext => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    if (!request.authentication) {
      throw new Error("Contexto de autenticação não encontrado.");
    }

    return request.authentication;
  }
);
