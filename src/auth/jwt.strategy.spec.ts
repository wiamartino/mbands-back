import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';
import { UsersService } from '../users/users.service';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let usersService: UsersService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: UsersService,
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'JWT_SECRET') {
                return 'test-secret';
              }
              return null;
            }),
          },
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    usersService = module.get<UsersService>(UsersService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should validate a JWT payload and return user data', async () => {
      const mockUser = {
        userId: 1,
        username: 'testuser',
        email: 'test@example.com',
        roles: [],
      } as any;
      jest.spyOn(usersService, 'findById').mockResolvedValue(mockUser);

      const payload = { sub: 1, username: 'testuser', email: 'test@example.com' };
      const result = await strategy.validate(payload);

      expect(usersService.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual({
        userId: 1,
        username: 'testuser',
        email: 'test@example.com',
        roles: [],
      });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      jest.spyOn(usersService, 'findById').mockResolvedValue(null);

      const payload = { sub: 999, username: 'nonexistent' };

      await expect(strategy.validate(payload)).rejects.toThrow(
        'User not found',
      );
    });

    it('should call findById with payload sub field', async () => {
      const mockUser = {
        userId: 42,
        username: 'testuser',
        email: 'test@example.com',
        roles: [],
      } as any;
      jest.spyOn(usersService, 'findById').mockResolvedValue(mockUser);

      const payload = { sub: 42, username: 'testuser' };
      await strategy.validate(payload);

      expect(usersService.findById).toHaveBeenCalledWith(42);
    });
  });
});
