import { Controller, Get } from "@nestjs/common";

@Controller()
export class SystemController {
  @Get()
  getInfo(): { name: string; description: string } {
    return {
      name: "backend",
      description: "API de planejamento financeiro pessoal."
    };
  }
}
