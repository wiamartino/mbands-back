import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { MembersService } from './members.service';
import { Member } from './entities/member.entity';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';

describe('MembersService', () => {
  let service: MembersService;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    softDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MembersService,
        {
          provide: getRepositoryToken(Member),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<MembersService>(MembersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new member', async () => {
      const createMemberDto: CreateMemberDto = {
        name: 'John Doe',
        instrument: 'Guitar',
        bandId: 1,
      };
      const savedMember = { id: 1, ...createMemberDto };

      mockRepository.create.mockReturnValue(createMemberDto);
      mockRepository.save.mockResolvedValue(savedMember);

      const result = await service.create(createMemberDto);

      expect(mockRepository.create).toHaveBeenCalledWith(createMemberDto);
      expect(mockRepository.save).toHaveBeenCalledWith(createMemberDto);
      expect(result).toEqual(savedMember);
    });
  });

  describe('findAll', () => {
    it('should return all members with relations', async () => {
      const members = [
        { id: 1, name: 'John Doe' },
        { id: 2, name: 'Jane Doe' },
      ];
      mockRepository.find.mockResolvedValue(members);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(mockRepository.find).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        relations: {
          band: {
            country: true,
            albums: true,
          },
        },
      });
      expect(result).toEqual(members);
    });
  });

  describe('findOne', () => {
    it('should return a member by id with relations', async () => {
      const member = { id: 1, name: 'John Doe' };
      mockRepository.findOne.mockResolvedValue(member);

      const result = await service.findOne(1);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: {
          band: {
            country: true,
            albums: true,
          },
        },
      });
      expect(result).toEqual(member);
    });
  });

  describe('update', () => {
    it('should update a member and return the updated member', async () => {
      const updateMemberDto: UpdateMemberDto = { name: 'Updated Name' };
      const updatedMember = { id: 1, name: 'Updated Name' };

      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockRepository.findOne.mockResolvedValue(updatedMember);

      const result = await service.update(1, updateMemberDto);

      expect(mockRepository.update).toHaveBeenCalledWith(1, updateMemberDto);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: {
          band: {
            country: true,
            albums: true,
          },
        },
      });
      expect(result).toEqual(updatedMember);
    });
  });

  describe('remove', () => {
    it('should delete a member', async () => {
      const deleteResult = { affected: 1, raw: [], generatedMaps: [] };
      mockRepository.softDelete.mockResolvedValue(deleteResult);

      const result = await service.remove(1);

      expect(mockRepository.softDelete).toHaveBeenCalledWith(1);
      expect(result).toEqual(deleteResult);
    });
  });
});
