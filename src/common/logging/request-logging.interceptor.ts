import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from "@nestjs/common";
import { Observable, tap } from "rxjs";

type HttpRequest = {
  method: string;
  originalUrl?: string;
  url: string;
};

@Injectable()
export class RequestLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger("HTTP");

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<HttpRequest>();

    const method = request.method;
    const url = request.originalUrl ?? request.url;
    const startedAt = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          this.logger.log(`${method} ${url} ${Date.now() - startedAt}ms`);
        },
        error: (error: unknown) => {
          const errorName = error instanceof Error ? error.name : "UnknownError";

          this.logger.warn(`${method} ${url} ${errorName} ${Date.now() - startedAt}ms`);
        }
      })
    );
  }
}
