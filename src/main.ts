import { NestFactory } from "@nestjs/core";
import { AppModule } from "@src/app.module";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  await app.listen(8008);
}

void bootstrap();
