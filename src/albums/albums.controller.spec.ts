import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AlbumsController } from './albums.controller';
import { AlbumsService } from './albums.service';
import { Album } from './entities/album.entity';

const mockAlbumsRepository = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe('AlbumsController', () => {
  let controller: AlbumsController;
  let service: AlbumsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AlbumsController],
      providers: [
        AlbumsService,
        {
          provide: getRepositoryToken(Album),
          useValue: mockAlbumsRepository,
        },
      ],
    }).compile();

    controller = module.get<AlbumsController>(AlbumsController);
    service = module.get<AlbumsService>(AlbumsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new album', async () => {
      const createAlbumDto = { title: 'Test Album', bandId: 1 };
      const mockAlbum = { id: 1, title: 'Test Album' };
      jest.spyOn(service, 'create').mockResolvedValue(mockAlbum as any);

      const result = await controller.create(createAlbumDto as any);

      expect(service.create).toHaveBeenCalledWith(createAlbumDto);
      expect(result).toEqual(mockAlbum);
    });
  });

  describe('findAll', () => {
    it('should return an array of albums', async () => {
      const pagination = { page: 1, limit: 10 };
      const mockAlbums = [{ id: 1, title: 'Album 1' }];
      jest.spyOn(service, 'findAll').mockResolvedValue(mockAlbums as any);

      const result = await controller.findAll(pagination as any);

      expect(service.findAll).toHaveBeenCalledWith(pagination);
      expect(result).toEqual(mockAlbums);
    });
  });

  describe('findOne', () => {
    it('should return a single album by id', async () => {
      const mockAlbum = { id: 1, title: 'Test Album' };
      jest.spyOn(service, 'findOne').mockResolvedValue(mockAlbum as any);

      const result = await controller.findOne('1');

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockAlbum);
    });
  });

  describe('findB', () => {
    it('should return albums by band id', async () => {
      const mockAlbums = [{ id: 1, title: 'Album 1', bandId: 5 }];
      jest.spyOn(service, 'findByBandId').mockResolvedValue(mockAlbums as any);

      const result = await controller.findB('5');

      expect(service.findByBandId).toHaveBeenCalledWith(5);
      expect(result).toEqual(mockAlbums);
    });
  });

  describe('update', () => {
    it('should update an album', async () => {
      const updateAlbumDto = { title: 'Updated Album' };
      const mockAlbum = { id: 1, title: 'Updated Album' };
      jest.spyOn(service, 'update').mockResolvedValue(mockAlbum as any);

      const result = await controller.update('1', updateAlbumDto as any);

      expect(service.update).toHaveBeenCalledWith(1, updateAlbumDto);
      expect(result).toEqual(mockAlbum);
    });
  });

  describe('remove', () => {
    it('should delete an album', async () => {
      jest.spyOn(service, 'remove').mockResolvedValue(undefined);

      await controller.remove('1');

      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
});
