import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService - Race Condition Fixes', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;
  let configService: ConfigService;

  const mockUser = {
    userId: 1,
    username: 'john',
    password: 'hashedPassword',
    email: 'john@test.com',
    firstName: 'John',
    lastName: 'Doe',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastLoginAt: null,
    roles: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findOne: jest.fn(),
            findByEmail: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            updateLastLogin: jest.fn(),
            updateRefreshToken: jest.fn(),
            updateRefreshTokenAndLastLogin: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
            decode: jest.fn(() => ({ exp: Math.floor(Date.now() / 1000) + 604800 })),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
  });

  describe('register - TOCTOU Fix', () => {
    it('should handle database unique constraint violations for username', async () => {
      const registerDto = {
        username: 'john',
        password: 'password123',
        email: 'john@test.com',
        firstName: 'John',
        lastName: 'Doe',
      };

      const dbError = new Error('duplicate key value violates unique constraint');
      (dbError as any).code = '23505';
      (dbError as any).detail = 'Key (username)=(john) already exists.';

      (usersService.create as jest.Mock).mockRejectedValueOnce(dbError);

      await expect(authService.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should handle database unique constraint violations for email', async () => {
      const registerDto = {
        username: 'jane',
        password: 'password123',
        email: 'john@test.com',
        firstName: 'Jane',
        lastName: 'Doe',
      };

      const dbError = new Error('duplicate key value violates unique constraint');
      (dbError as any).code = '23505';
      (dbError as any).detail = 'Key (email)=(john@test.com) already exists.';

      (usersService.create as jest.Mock).mockRejectedValueOnce(dbError);

      await expect(authService.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should NOT perform app-level existence checks before inserting', async () => {
      const registerDto = {
        username: 'newuser',
        password: 'password123',
        email: 'newuser@test.com',
        firstName: 'New',
        lastName: 'User',
      };

      (usersService.create as jest.Mock).mockResolvedValueOnce(mockUser);
      (jwtService.sign as jest.Mock).mockReturnValue('token');
      (configService.get as jest.Mock).mockReturnValue('secret');
      (usersService.updateRefreshTokenAndLastLogin as jest.Mock).mockResolvedValueOnce(
        undefined,
      );

      await authService.register(registerDto);

      expect(usersService.findOne).not.toHaveBeenCalled();
      expect(usersService.findByEmail).not.toHaveBeenCalled();
    });
  });

  describe('login - Atomic Token Update', () => {
    it('should update refresh token and last login atomically', async () => {
      (usersService.findOne as jest.Mock).mockResolvedValueOnce(mockUser);
      (jwtService.sign as jest.Mock).mockReturnValue('token');
      (configService.get as jest.Mock).mockReturnValue('secret');
      (usersService.updateRefreshTokenAndLastLogin as jest.Mock).mockResolvedValueOnce(
        undefined,
      );

      await authService.login(mockUser);

      expect(usersService.updateRefreshTokenAndLastLogin).toHaveBeenCalled();
      expect(usersService.updateLastLogin).not.toHaveBeenCalled();
    });
  });
});
