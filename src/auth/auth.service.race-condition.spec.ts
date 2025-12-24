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
    it('should handle database unique constraint violations for username (code 23505)', async () => {\n      const registerDto = {\n        username: 'john',\n        password: 'password123',\n        email: 'john@test.com',\n        firstName: 'John',\n        lastName: 'Doe',\n      };\n\n      // Mock database constraint violation error\n      const dbError = new Error('duplicate key value violates unique constraint');\n      (dbError as any).code = '23505';\n      (dbError as any).detail = 'Key (username)=(john) already exists.';\n\n      (usersService.create as jest.Mock).mockRejectedValueOnce(dbError);\n\n      await expect(authService.register(registerDto)).rejects.toThrow(\n        ConflictException,\n      );\n    });\n\n    it('should handle database unique constraint violations for email (code 23505)', async () => {\n      const registerDto = {\n        username: 'jane',\n        password: 'password123',\n        email: 'john@test.com',\n        firstName: 'Jane',\n        lastName: 'Doe',\n      };\n\n      // Mock database constraint violation error\n      const dbError = new Error('duplicate key value violates unique constraint');\n      (dbError as any).code = '23505';\n      (dbError as any).detail = 'Key (email)=(john@test.com) already exists.';\n\n      (usersService.create as jest.Mock).mockRejectedValueOnce(dbError);\n\n      await expect(authService.register(registerDto)).rejects.toThrow(\n        ConflictException,\n      );\n    });\n\n    it('should NOT perform app-level existence checks before inserting', async () => {\n      const registerDto = {\n        username: 'newuser',\n        password: 'password123',\n        email: 'newuser@test.com',\n        firstName: 'New',\n        lastName: 'User',\n      };\n\n      (usersService.create as jest.Mock).mockResolvedValueOnce(mockUser);\n      (jwtService.sign as jest.Mock).mockReturnValueOnce('token');\n      (configService.get as jest.Mock).mockReturnValueOnce('secret');\n      (usersService.updateRefreshTokenAndLastLogin as jest.Mock).mockResolvedValueOnce(\n        undefined,\n      );\n\n      await authService.register(registerDto);\n\n      // Should NOT call findOne or findByEmail to check existence\n      expect(usersService.findOne).not.toHaveBeenCalled();\n      expect(usersService.findByEmail).not.toHaveBeenCalled();\n    });\n  });\n\n  describe('login - Atomic Token Update', () => {\n    it('should update refresh token and last login atomically', async () => {\n      const loginDto = { username: 'john', password: 'password123' };\n\n      (usersService.findOne as jest.Mock).mockResolvedValueOnce(mockUser);\n      (jwtService.sign as jest.Mock).mockReturnValue('token');\n      (configService.get as jest.Mock).mockReturnValue('secret');\n      (usersService.updateRefreshTokenAndLastLogin as jest.Mock).mockResolvedValueOnce(\n        undefined,\n      );\n\n      await authService.login(mockUser);\n\n      // Should use the new atomic method, not separate calls\n      expect(usersService.updateRefreshTokenAndLastLogin).toHaveBeenCalled();\n      // Should NOT have been called with separate operations\n      expect(usersService.updateLastLogin).not.toHaveBeenCalled();\n    });\n  });\n\n  describe('refresh tokens - TOCTOU Fix', () => {\n    it('should handle concurrent token refresh attempts', async () => {\n      const refreshToken = 'validToken';\n      const refreshPayload = { sub: 1 };\n\n      (jwtService.verify as jest.Mock).mockReturnValueOnce(refreshPayload);\n      (usersService.findById as jest.Mock).mockResolvedValueOnce({\n        ...mockUser,\n        refreshTokenHash: await bcrypt.hash(refreshToken, 10),\n        refreshTokenExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),\n      });\n      (jwtService.sign as jest.Mock).mockReturnValue('newToken');\n      (configService.get as jest.Mock).mockReturnValue('secret');\n      (usersService.updateRefreshTokenAndLastLogin as jest.Mock).mockResolvedValueOnce(\n        undefined,\n      );\n\n      const result = await authService.refreshTokens(refreshToken);\n\n      expect(result).toBeDefined();\n      expect(result.access_token).toBeDefined();\n      expect(result.refresh_token).toBeDefined();\n      // Atomic update should be called\n      expect(usersService.updateRefreshTokenAndLastLogin).toHaveBeenCalled();\n    });\n  });\n});\n