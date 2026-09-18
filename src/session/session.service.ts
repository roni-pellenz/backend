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

  async findValid(token: string) {
    const tokenHash = this.hash(token);

    return this.database.session.findFirst({
      where: {
        tokenHash,
        revokedAt: null,
        expiresAt: {
          gt: new Date()
        }
      },
      include: {
        user: true
      }
    });
  }

  async revoke(sessionId: string): Promise<void> {
    await this.database.session.update({
      where: {
        id: sessionId
      },
      data: {
        revokedAt: new Date()
      }
    });
  }

  private hash(token: string): string {
    return createHash("sha256").update(token).digest("hex");
  }
}
