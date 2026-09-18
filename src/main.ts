import { NestFactory } from "@nestjs/core";
import { AppModule } from "@src/app.module";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  await app.listen(Number(process.env.PORT ?? 8008));
}

void bootstrap();
