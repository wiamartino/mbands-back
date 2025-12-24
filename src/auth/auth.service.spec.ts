import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto';

// Mock bcrypt
jest.mock('bcrypt');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;
  let configService: ConfigService;

  const mockUser = {
    userId: 1,
    username: 'testuser',
    email: 'test@example.com',
    password: 'hashedPassword',
    firstName: 'Test',
    lastName: 'User',
    isActive: true,
    createdAt: new Date(),
    roles: [],
    lastLoginAt: null,
    updatedAt: new Date(),
    deletedAt: null,
  };

  const mockUsersService = {
    findOne: jest.fn(),
    findByEmail: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    updateRefreshToken: jest.fn(),
    updateLastLogin: jest.fn(),
    updateRefreshTokenAndLastLogin: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    decode: jest.fn(),
    verify: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'JWT_SECRET') return 'jwt-secret';
      if (key === 'JWT_REFRESH_SECRET') return 'refresh-secret';
      if (key === 'JWT_ACCESS_EXPIRES_IN') return '15m';
      if (key === 'JWT_REFRESH_EXPIRES_IN') return '7d';
      return undefined;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user for valid credentials with bcrypt', async () => {
      mockUsersService.findOne.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(true as never);

      const result = await service.validateUser('testuser', 'password123');

      expect(usersService.findOne).toHaveBeenCalledWith('testuser');
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'password123',
        'hashedPassword',
      );
      expect(result).toEqual(mockUser);
    });

    it('should return null for non-existent user', async () => {
      mockUsersService.findOne.mockResolvedValue(null);

      const result = await service.validateUser('nonexistent', 'password123');

      expect(result).toBeNull();
    });

    it('should throw BadRequestException for invalid password', async () => {
      mockUsersService.findOne.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(false as never);

      await expect(
        service.validateUser('testuser', 'wrongpassword'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('login', () => {
    it('should return access token and user data', async () => {
      mockJwtService.sign
        .mockReturnValueOnce('access-token')
        .mockReturnValueOnce('refresh-token');
      mockJwtService.decode.mockReturnValue({
        exp: Math.floor(Date.now() / 1000) + 3600,
      });
      mockedBcrypt.hash.mockResolvedValue('hashed-refresh' as never);
      mockUsersService.updateRefreshTokenAndLastLogin.mockResolvedValue(
        undefined,
      );

      const result = await service.login(mockUser);

      expect(jwtService.sign).toHaveBeenNthCalledWith(
        1,
        {
          sub: mockUser.userId,
          username: mockUser.username,
          email: mockUser.email,
        },
        expect.any(Object),
      );
      expect(jwtService.sign).toHaveBeenCalledTimes(2);
      expect(jwtService.decode).toHaveBeenCalledWith('refresh-token');
      expect(usersService.updateRefreshTokenAndLastLogin).toHaveBeenCalledWith(
        mockUser.userId,
        'hashed-refresh',
        expect.any(Date),
      );
      expect(result).toEqual({
        access_token: 'access-token',
        refresh_token: 'refresh-token',
        user: {
          id: mockUser.userId.toString(),
          username: mockUser.username,
          email: mockUser.email,
          firstName: mockUser.firstName,
          lastName: mockUser.lastName,
          isActive: mockUser.isActive,
          createdAt: mockUser.createdAt,
        },
      });
    });
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      username: 'newuser',
      password: 'NewSecurePass123!',
      email: 'newuser@example.com',
      firstName: 'New',
      lastName: 'User',
    };

    it('should register user successfully', async () => {
      mockUsersService.create.mockResolvedValue(mockUser);
      mockUsersService.updateRefreshTokenAndLastLogin.mockResolvedValue(
        undefined,
      );
      mockedBcrypt.hash
        .mockResolvedValueOnce('hashedPassword' as never)
        .mockResolvedValueOnce('hashed-refresh' as never);
      mockJwtService.sign
        .mockReturnValueOnce('access-token')
        .mockReturnValueOnce('refresh-token');
      mockJwtService.decode.mockReturnValue({
        exp: Math.floor(Date.now() / 1000) + 3600,
      });

      const result = await service.register(registerDto);

      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
      expect(usersService.create).toHaveBeenCalledWith({
        username: registerDto.username,
        password: 'hashedPassword',
        email: registerDto.email,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        isActive: true,
      });
      expect(usersService.updateRefreshTokenAndLastLogin).toHaveBeenCalledWith(
        mockUser.userId,
        'hashed-refresh',
        expect.any(Date),
      );
      expect(result).toHaveProperty('access_token', 'access-token');
      expect(result).toHaveProperty('refresh_token', 'refresh-token');
      expect(result).toHaveProperty('user');
    });

    it('should throw ConflictException for existing username', async () => {
      const dbError = new Error('duplicate key value');
      (dbError as any).code = '23505';
      (dbError as any).detail = 'Key (username)=(newuser) already exists.';
      mockUsersService.create.mockRejectedValue(dbError);

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw ConflictException for existing email', async () => {
      const dbError = new Error('duplicate key value');
      (dbError as any).code = '23505';
      (dbError as any).detail = 'Key (email)=(newuser@example.com) already exists.';
      mockUsersService.create.mockRejectedValue(dbError);

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });
});
