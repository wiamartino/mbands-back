import { Test, TestingModule } from '@nestjs/testing';
import { BandsService } from './bands.service';
import { BandsRepository } from './bands.repository';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Band } from './entities/band.entity';
import { Country } from '../countries/entities/country.entity';
import { DataSource } from 'typeorm';

describe('BandsService - Optimistic Locking', () => {
  let bandsService: BandsService;
  let bandsRepository: BandsRepository;
  let dataSource: DataSource;

  const mockBand = {
    id: 1,
    name: 'The Beatles',
    genre: 'Rock',
    yearFormed: 1960,
    version: 1,
    active: true,
    website: 'https://www.thebeatles.com',
    description: 'English rock band',
    imageUrl: null,
    country: { id: 1, name: 'United Kingdom' },
    members: [],
    albums: [],
    songs: [],
    events: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BandsService,
        {
          provide: BandsRepository,
          useValue: {
            findOne: jest.fn(),
            update: jest.fn(),
            findOneWithRelations: jest.fn(),
            softDelete: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            findByNamePattern: jest.fn(),
            findByFirstLetter: jest.fn(),
            findByGenre: jest.fn(),
            findByYear: jest.fn(),
            findByCountry: jest.fn(),
            findAllWithRelations: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Country),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: {
            createQueryRunner: jest.fn(),
          },
        },
      ],
    }).compile();

    bandsService = module.get<BandsService>(BandsService);
    bandsRepository = module.get<BandsRepository>(BandsRepository);
    dataSource = module.get<DataSource>(DataSource);
  });

  describe('update with optimistic locking', () => {
    it('should throw ConflictException when version has been modified', async () => {
      const bandId = 1;
      const updateDto = { name: 'The Rolling Stones' };

      (bandsRepository.findOne as jest.Mock).mockResolvedValueOnce(mockBand);

      (bandsRepository.update as jest.Mock).mockResolvedValueOnce({
        affected: 0,
      });

      await expect(
        bandsService.update(bandId, updateDto),
      ).rejects.toThrow(ConflictException);

      expect(bandsRepository.update).toHaveBeenCalledWith(
        { id: bandId, version: mockBand.version },
        updateDto,
      );
    });

    it('should successfully update when version matches', async () => {
      const bandId = 1;
      const updateDto = { name: 'The Rolling Stones' };
      const updatedBand = { ...mockBand, name: 'The Rolling Stones', version: 2 };

      (bandsRepository.findOne as jest.Mock).mockResolvedValueOnce(mockBand);

      (bandsRepository.update as jest.Mock).mockResolvedValueOnce({
        affected: 1,
      });

      (bandsRepository.findOneWithRelations as jest.Mock).mockResolvedValueOnce(
        updatedBand,
      );

      const result = await bandsService.update(bandId, updateDto);

      expect(result).toEqual(updatedBand);
      expect(bandsRepository.update).toHaveBeenCalledWith(
        { id: bandId, version: mockBand.version },
        updateDto,
      );
    });

    it('should throw NotFoundException when band does not exist', async () => {
      const bandId = 999;
      const updateDto = { name: 'Unknown Band' };

      (bandsRepository.findOne as jest.Mock).mockResolvedValueOnce(null);

      await expect(
        bandsService.update(bandId, updateDto),
      ).rejects.toThrow(NotFoundException);

      expect(bandsRepository.update).not.toHaveBeenCalled();
    });

    it('should handle database unique constraint violations', async () => {
      const bandId = 1;
      const updateDto = { name: 'Existing Band' };

      (bandsRepository.findOne as jest.Mock).mockResolvedValueOnce(mockBand);

      const dbError = new Error('duplicate key value violates unique constraint');
      (dbError as any).code = '23505';
      (bandsRepository.update as jest.Mock).mockRejectedValueOnce(dbError);

      await expect(
        bandsService.update(bandId, updateDto),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('optimistic locking prevents lost updates', () => {
    it('scenario: concurrent updates to different fields', async () => {
      const bandId = 1;

      const updateDto1 = { name: 'New Name' };
      const updateDto2 = { genre: 'Heavy Metal' };

      (bandsRepository.findOne as jest.Mock)
        .mockResolvedValueOnce(mockBand)
        .mockResolvedValueOnce(mockBand);

      (bandsRepository.update as jest.Mock).mockResolvedValueOnce({
        affected: 1,
      });

      (bandsRepository.update as jest.Mock).mockResolvedValueOnce({
        affected: 0,
      });

      await bandsService.update(bandId, updateDto1);

      await expect(
        bandsService.update(bandId, updateDto2),
      ).rejects.toThrow(ConflictException);

      expect(bandsRepository.update).toHaveBeenNthCalledWith(
        1,
        { id: bandId, version: 1 },
        updateDto1,
      );
      expect(bandsRepository.update).toHaveBeenNthCalledWith(
        2,
        { id: bandId, version: 1 },
        updateDto2,
      );
    });
  });
});
