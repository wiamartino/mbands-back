import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AlbumsService } from './albums.service';
import { Album } from './entities/album.entity';

const mockAlbumsRepository = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  softDelete: jest.fn(),
  findOneWithRelations: jest.fn(),
};

describe('AlbumsService', () => {
  let service: AlbumsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlbumsService,
        {
          provide: getRepositoryToken(Album),
          useValue: mockAlbumsRepository,
        },
      ],
    }).compile();

    service = module.get<AlbumsService>(AlbumsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create() should call repository create and save', async () => {
    mockAlbumsRepository.create.mockReturnValue({ id: 1 });
    mockAlbumsRepository.save.mockResolvedValue({ id: 1 });

    const result = await service.create({ title: 'Test Album' } as any);
    expect(mockAlbumsRepository.create).toHaveBeenCalledWith({
      title: 'Test Album',
    });
    expect(mockAlbumsRepository.save).toHaveBeenCalledWith({ id: 1 });
    expect(result.id).toBe(1);
  });

  it('findAll() should call repository find', async () => {
    mockAlbumsRepository.find.mockResolvedValue([]);
    const result = await service.findAll({ page: 1, limit: 10 });
    expect(mockAlbumsRepository.find).toHaveBeenCalledWith({
      skip: 0,
      take: 10,
      relations: {
        band: true,
        songs: true,
      },
    });
    expect(result).toEqual([]);
  });

  it('findOne() should call repository findOne', async () => {
    mockAlbumsRepository.findOne.mockResolvedValue({ id: 1 });
    const result = await service.findOne(1);
    expect(mockAlbumsRepository.findOne).toHaveBeenCalledWith({
      where: { id: 1 },
      relations: {
        band: {
          country: true,
        },
        songs: {
          band: true,
        },
      },
    });
    expect(result.id).toBe(1);
  });

  it('update() should call repository update', async () => {
    const mockAlbum = { id: 1, version: 1 };
    mockAlbumsRepository.findOne.mockResolvedValueOnce(mockAlbum);
    mockAlbumsRepository.update.mockResolvedValue({ affected: 1 });
    mockAlbumsRepository.findOne.mockResolvedValueOnce({
      ...mockAlbum,
      title: 'Updated',
    });
    const result = await service.update(1, { title: 'Updated' } as any);
    expect(mockAlbumsRepository.update).toHaveBeenCalledWith(
      { id: 1, version: 1 },
      { title: 'Updated' },
    );
    expect(result).toEqual({ ...mockAlbum, title: 'Updated' });
  });

  it('remove() should call repository delete', async () => {
    mockAlbumsRepository.softDelete.mockResolvedValue({ affected: 1 });
    await service.remove(1);
    expect(mockAlbumsRepository.softDelete).toHaveBeenCalledWith(1);
  });
});
