import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { User } from './entities/user.entity';

const mockUsersRepository = {
  findOne: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
};

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: mockUsersRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should find a user by username', async () => {
      const mockUser = { userId: 1, username: 'testuser', roles: [] };
      mockUsersRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findOne('testuser');

      expect(mockUsersRepository.findOne).toHaveBeenCalledWith({
        where: { username: 'testuser' },
        relations: ['roles'],
      });
      expect(result).toEqual(mockUser);
    });

    it('should return undefined if user not found', async () => {
      mockUsersRepository.findOne.mockResolvedValue(undefined);

      const result = await service.findOne('nonexistent');

      expect(result).toBeUndefined();
    });
  });

  describe('findByEmail', () => {
    it('should find a user by email', async () => {
      const mockUser = { userId: 1, email: 'test@example.com', roles: [] };
      mockUsersRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@example.com');

      expect(mockUsersRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        relations: ['roles'],
      });
      expect(result).toEqual(mockUser);
    });

    it('should return undefined if email not found', async () => {
      mockUsersRepository.findOne.mockResolvedValue(undefined);

      const result = await service.findByEmail('notfound@example.com');

      expect(result).toBeUndefined();
    });
  });

  describe('findById', () => {
    it('should find a user by id', async () => {
      const mockUser = { userId: 1, username: 'testuser', roles: [] };
      mockUsersRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findById(1);

      expect(mockUsersRepository.findOne).toHaveBeenCalledWith({
        where: { userId: 1 },
        relations: ['roles'],
      });
      expect(result).toEqual(mockUser);
    });

    it('should return undefined if user id not found', async () => {
      mockUsersRepository.findOne.mockResolvedValue(undefined);

      const result = await service.findById(999);

      expect(result).toBeUndefined();
    });
  });

  describe('create', () => {
    it('should create and save a new user', async () => {
      const newUser = {
        userId: 1,
        username: 'newuser',
        email: 'new@example.com',
      } as User;
      mockUsersRepository.save.mockResolvedValue(newUser);

      const result = await service.create(newUser);

      expect(mockUsersRepository.save).toHaveBeenCalledWith(newUser);
      expect(result).toEqual(newUser);
    });
  });

  describe('updateLastLogin', () => {
    it('should update lastLoginAt timestamp', async () => {
      mockUsersRepository.update.mockResolvedValue({ affected: 1 });

      await service.updateLastLogin(1);

      expect(mockUsersRepository.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          lastLoginAt: expect.any(Date),
        }),
      );
    });
  });

  describe('updateRefreshToken', () => {
    it('should update refresh token with expiration date', async () => {
      mockUsersRepository.update.mockResolvedValue({ affected: 1 });
      const expiresAt = new Date();

      await service.updateRefreshToken(1, 'tokenHash', expiresAt);

      expect(mockUsersRepository.update).toHaveBeenCalledWith(1, {
        refreshTokenHash: 'tokenHash',
        refreshTokenExpiresAt: expiresAt,
      });
    });

    it('should clear refresh token when hash is null', async () => {
      mockUsersRepository.update.mockResolvedValue({ affected: 1 });

      await service.updateRefreshToken(1, null);

      expect(mockUsersRepository.update).toHaveBeenCalledWith(1, {
        refreshTokenHash: null,
        refreshTokenExpiresAt: null,
      });
    });

    it('should set expiresAt to null when not provided', async () => {
      mockUsersRepository.update.mockResolvedValue({ affected: 1 });

      await service.updateRefreshToken(1, 'tokenHash', null);

      expect(mockUsersRepository.update).toHaveBeenCalledWith(1, {
        refreshTokenHash: 'tokenHash',
        refreshTokenExpiresAt: null,
      });
    });
  });
});
