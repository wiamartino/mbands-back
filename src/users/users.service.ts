import { Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private usersRepository: UsersRepository) {}

  async findOne(username: string): Promise<User | undefined> {
    return this.usersRepository.findOne({
      where: { username },
      relations: ['roles'],
    });
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.usersRepository.findOne({
      where: { email },
      relations: ['roles'],
    });
  }

  async findById(userId: number): Promise<User | undefined> {
    return this.usersRepository.findOne({
      where: { userId },
      relations: ['roles'],
    });
  }

  async create(user: User): Promise<User> {
    return this.usersRepository.save(user);
  }

  async updateLastLogin(userId: number): Promise<void> {
    await this.usersRepository.update(userId, {
      lastLoginAt: new Date(),
    });
  }

  async updateRefreshToken(
    userId: number,
    refreshTokenHash: string | null,
    refreshTokenExpiresAt?: Date | null,
  ): Promise<void> {
    await this.usersRepository.update(userId, {
      refreshTokenHash,
      refreshTokenExpiresAt: refreshTokenExpiresAt ?? null,
    });
  }

  async updateRefreshTokenAndLastLogin(
    userId: number,
    refreshTokenHash: string | null,
    refreshTokenExpiresAt?: Date | null,
  ): Promise<void> {
    // Atomic update to prevent concurrent login race conditions
    // Both fields are updated in a single database operation
    await this.usersRepository.update(userId, {
      refreshTokenHash,
      refreshTokenExpiresAt: refreshTokenExpiresAt ?? null,
      lastLoginAt: new Date(),
    });
  }
}
