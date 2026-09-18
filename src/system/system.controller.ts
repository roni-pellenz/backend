import { Controller, Get, ServiceUnavailableException } from "@nestjs/common";
import { DatabaseService } from "@src/database/database.service";

@Controller()
export class SystemController {
  constructor(private readonly database: DatabaseService) {}

  @Get()
  getInfo(): { name: string; description: string } {
    return {
      name: "finance-backend",
      description: "API de planejamento financeiro pessoal."
    };
  }

  @Get("health")
  async getHealth(): Promise<{ status: string; database: string }> {
    try {
      await this.database.$queryRaw`SELECT 1`;

      return {
        status: "ok",
        database: "ok"
      };
    } catch {
      throw new ServiceUnavailableException("Banco de dados indisponível.");
    }
  }
}
