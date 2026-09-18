import { Controller, Get } from "@nestjs/common";

@Controller()
export class SystemController {
  @Get()
  getInfo(): { name: string; description: string } {
    return {
      name: "finance-backend",
      description: "API de planejamento financeiro pessoal."
    };
  }

  @Get("health")
  getHealth(): { status: string } {
    return {
      status: "ok"
    };
  }
}
