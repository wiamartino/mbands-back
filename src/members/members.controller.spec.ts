import { Test, TestingModule } from '@nestjs/testing';
import { MembersController } from './members.controller';
import { MembersService } from './members.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';

describe('MembersController', () => {
  let controller: MembersController;

  let service: MembersService;

  const mockMembersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MembersController],
      providers: [
        {
          provide: MembersService,
          useValue: mockMembersService,
        },
      ],
    }).compile();

    controller = module.get<MembersController>(MembersController);
    service = module.get<MembersService>(MembersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new member', async () => {
      const createMemberDto: CreateMemberDto = {
        name: 'John Doe',
        instrument: 'Guitar',
        bandId: 1,
      };
      const result = { id: 1, ...createMemberDto };
      mockMembersService.create.mockResolvedValue(result);

      expect(await controller.create(createMemberDto)).toEqual(result);
      expect(service.create).toHaveBeenCalledWith(createMemberDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of members', async () => {
      const result = [{ id: 1, name: 'John Doe', instrument: 'Guitar' }];
      mockMembersService.findAll.mockResolvedValue(result);

      expect(await controller.findAll()).toEqual(result);
      expect(service.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1, limit: 10 }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a single member', async () => {
      const result = { id: 1, name: 'John Doe', instrument: 'Guitar' };
      mockMembersService.findOne.mockResolvedValue(result);

      expect(await controller.findOne('1')).toEqual(result);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should update a member', async () => {
      const updateMemberDto: UpdateMemberDto = { name: 'Jane Doe' };
      const result = { id: 1, name: 'Jane Doe', instrument: 'Guitar' };
      mockMembersService.update.mockResolvedValue(result);

      expect(await controller.update('1', updateMemberDto)).toEqual(result);
      expect(service.update).toHaveBeenCalledWith(1, updateMemberDto);
    });
  });

  describe('remove', () => {
    it('should remove a member', async () => {
      const result = { raw: [], affected: 1, generatedMaps: [] };
      mockMembersService.remove.mockResolvedValue(result);

      expect(await controller.remove('1')).toEqual(result);
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
});
