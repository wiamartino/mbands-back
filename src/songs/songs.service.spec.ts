import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SongsService } from './songs.service';
import { Song } from './entities/song.entity';
import { Repository } from 'typeorm';
import { CreateSongDto } from './dto/create-song.dto';
import { UpdateSongDto } from './dto/update-song.dto';

describe('SongsService', () => {
  let service: SongsService;
  let repository: jest.Mocked<Repository<Song>>;

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      softDelete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SongsService,
        {
          provide: getRepositoryToken(Song),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<SongsService>(SongsService);
    repository = module.get<Repository<Song>>(
      getRepositoryToken(Song),
    ) as jest.Mocked<Repository<Song>>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a song', async () => {
    const dto: CreateSongDto = { title: 'Test Title', bandId: 1 };
    const songEntity = {
      id: 1,
      title: dto.title,
      duration: null,
      trackNumber: null,
      lyrics: null,
      videoUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      band: null,
      albums: [],
    } as Song;
    repository.create.mockReturnValue(songEntity);
    repository.save.mockResolvedValue(songEntity);

    const result = await service.create(dto);
    expect(repository.create).toHaveBeenCalledWith(dto);
    expect(repository.save).toHaveBeenCalledWith(songEntity);
    expect(result).toEqual(songEntity);
  });

  it('should find all songs', async () => {
    const songs = [
      {
        id: 1,
        title: 'Song 1',
        createdAt: new Date(),
        updatedAt: new Date(),
        band: null,
        albums: [],
      } as Song,
      {
        id: 2,
        title: 'Song 2',
        createdAt: new Date(),
        updatedAt: new Date(),
        band: null,
        albums: [],
      } as Song,
    ];
    repository.find.mockResolvedValue(songs);

    const result = await service.findAll();
    expect(repository.find).toHaveBeenCalled();
    expect(result).toEqual(songs);
  });

  it('should find a song by id', async () => {
    const song = {
      id: 1,
      title: 'Test Song',
      createdAt: new Date(),
      updatedAt: new Date(),
      band: null,
      albums: [],
    } as Song;
    repository.findOne.mockResolvedValue(song);

    const result = await service.findOne(1);
    expect(repository.findOne).toHaveBeenCalledWith({
      where: { id: 1 },
      relations: {
        albums: {
          band: true,
        },
        band: {
          country: true,
        },
      },
    });
    expect(result).toEqual(song);
  });

  it('should update a song', async () => {
    const dto: UpdateSongDto = { title: 'Updated Title' };
    repository.update.mockResolvedValue({
      affected: 1,
      generatedMaps: [],
      raw: [],
    });

    const result = await service.update(1, dto);
    expect(repository.update).toHaveBeenCalledWith(1, dto);
    expect(result.affected).toBe(1);
  });

  it('should remove a song', async () => {
    repository.softDelete.mockResolvedValue({
      affected: 1,
      raw: [],
      generatedMaps: [],
    });

    await service.remove(1);
    expect(repository.softDelete).toHaveBeenCalledWith(1);
  });
});
