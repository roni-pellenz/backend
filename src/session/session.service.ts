import { Injectable } from "@nestjs/common";
import { createHash, randomBytes } from "node:crypto";
import { DatabaseService } from "@src/database/database.service";

@Injectable()
export class SessionService {
  constructor(private readonly database: DatabaseService) {}

  async create(userId: string): Promise<string> {
    const token = randomBytes(32).toString("hex");
    const tokenHash = this.hash(token);

    const expiresAt = new Date();

    expiresAt.setDate(expiresAt.getDate() + 30);

    await this.database.session.create({
      data: {
        userId,
        tokenHash,
        expiresAt
      }
    });

    return token;
  }

  hash(token: string): string {
    return createHash("sha256").update(token).digest("hex");
  }
}
