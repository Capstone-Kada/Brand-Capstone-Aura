import type {
  EmailVerificationToken,
  PasswordResetToken,
  PrismaClient,
  Role,
  User,
  RefreshToken,
} from '@prisma/client';
import type { IAuthRepository } from '../interfaces/auth.repository.interface.js';

export class AuthRepository implements IAuthRepository {
  constructor(private readonly db: PrismaClient) {}

  findByEmail(email: string): Promise<User | null> {
    return this.db.user.findUnique({ where: { email } });
  }

  findById(id: string): Promise<User | null> {
    return this.db.user.findUnique({ where: { id } });
  }

  createUser(data: {
    email: string;
    passwordHash: string;
    role?: Role;
    name?: string;
    isEmailVerified?: boolean;
    affiliator?: { handle: string; apiKey: string };
  }): Promise<User> {
    return this.db.user.create({
      data: {
        email: data.email,
        passwordHash: data.passwordHash,
        role: data.role ?? 'USER',
        isEmailVerified: data.isEmailVerified ?? false,
        profile: {
          create: {
            name: data.name ?? null,
          },
        },
        ...(data.affiliator
          ? {
              affiliatorProfile: {
                create: {
                  handle: data.affiliator.handle,
                  apiKey: data.affiliator.apiKey,
                },
              },
            }
          : {}),
      },
    });
  }

  createRefreshToken(data: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<RefreshToken> {
    return this.db.refreshToken.create({ data });
  }

  findRefreshTokenByHash(
    tokenHash: string,
  ): Promise<(RefreshToken & { user: User }) | null> {
    return this.db.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });
  }

  async revokeRefreshToken(id: string): Promise<void> {
    await this.db.refreshToken.update({
      where: { id },
      data: { revokedAt: new Date() },
    });
  }

  async revokeAllRefreshTokens(userId: string): Promise<void> {
    await this.db.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  createPasswordResetToken(data: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<PasswordResetToken> {
    return this.db.passwordResetToken.create({ data });
  }

  findPasswordResetByHash(
    tokenHash: string,
  ): Promise<(PasswordResetToken & { user: User }) | null> {
    return this.db.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });
  }

  async markPasswordResetUsed(id: string): Promise<void> {
    await this.db.passwordResetToken.update({
      where: { id },
      data: { usedAt: new Date() },
    });
  }

  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    await this.db.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
  }

  updateUser(userId: string, data: Partial<User>): Promise<User> {
    return this.db.user.update({
      where: { id: userId },
      data,
    });
  }

  createEmailVerificationToken(data: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<EmailVerificationToken> {
    return this.db.emailVerificationToken.create({ data });
  }

  findEmailVerificationByHash(
    tokenHash: string,
  ): Promise<(EmailVerificationToken & { user: User }) | null> {
    return this.db.emailVerificationToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });
  }

  async markEmailVerificationUsed(id: string): Promise<void> {
    await this.db.emailVerificationToken.update({
      where: { id },
      data: { usedAt: new Date() },
    });
  }

  findLatestEmailVerificationForUser(userId: string): Promise<EmailVerificationToken | null> {
    return this.db.emailVerificationToken.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
