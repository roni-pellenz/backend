import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@src/generated/prisma/client";

@Injectable()
export class DatabaseService extends PrismaClient implements OnModuleDestroy {
  constructor() {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error("A variável DATABASE_URL não foi definida.");
    }

    const schema = new URL(connectionString).searchParams.get("schema") ?? "public";

    const adapter = new PrismaPg(
      {
        connectionString,
        connectionTimeoutMillis: 5000
      },
      {
        schema
      }
    );

    super({
      adapter
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
