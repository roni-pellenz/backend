import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "@src/app.module";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  app.enableShutdownHooks();

  if (process.env.SWAGGER_ENABLED !== "false") {
    const swaggerConfig = new DocumentBuilder()
      .setTitle("Finance Backend")
      .setDescription("API de planejamento financeiro pessoal.")
      .setVersion("1.0.0")
      .addBearerAuth()
      .build();

    const documentFactory = () => SwaggerModule.createDocument(app, swaggerConfig);

    SwaggerModule.setup("docs", app, documentFactory);
  }

  await app.listen(Number(process.env.PORT ?? 8008), "0.0.0.0");
}

void bootstrap();
