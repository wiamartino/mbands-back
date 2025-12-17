import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { User } from './entities/user.entity';

const mockUsersRepository = {
  findOne: jest.fn(),
};

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: mockUsersRepository,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findOne', () => {
    it('should return a user by username', async () => {
      const mockUser = {
        userId: 1,
        username: 'testuser',
        email: 'test@example.com',
        roles: [],
      } as User;
      jest.spyOn(service, 'findOne').mockResolvedValue(mockUser);

      const result = await controller.findOne('testuser');

      expect(service.findOne).toHaveBeenCalledWith('testuser');
      expect(result).toEqual(mockUser);
    });

    it('should return undefined if user not found', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(undefined);

      const result = await controller.findOne('nonexistent');

      expect(result).toBeUndefined();
    });
  });
});
