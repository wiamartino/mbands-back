import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DeleteResult, DataSource } from 'typeorm';
import { BandsService } from './bands.service';
import { Band } from './entities/band.entity';
import { Country } from '../countries/entities/country.entity';
import { CreateBandDto } from './dto/create-band.dto';
import { UpdateBandDto } from './dto/update-band.dto';
import { BandsRepository } from './bands.repository';

describe('BandsService', () => {
  let service: BandsService;

  const mockBandsRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findAllWithRelations: jest.fn(),
    findOneWithRelations: jest.fn(),
    findByNamePattern: jest.fn(),
    findByFirstLetter: jest.fn(),
    findByGenre: jest.fn(),
    findByYear: jest.fn(),
    findByCountry: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    softDelete: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
    })),
  };

  const mockCountriesRepository = {
    findOne: jest.fn(),
  };

  const mockDataSource = {
    createQueryRunner: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BandsService,
        {
          provide: BandsRepository,
          useValue: mockBandsRepository,
        },
        {
          provide: getRepositoryToken(Country),
          useValue: mockCountriesRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<BandsService>(BandsService);
    module.get<Repository<Country>>(getRepositoryToken(Country));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a band successfully', async () => {
      const createBandDto: CreateBandDto = {
        name: 'Test Band',
        countryId: 1,
        genre: 'Rock',
        yearFormed: 2020,
      };
      const mockCountry = { id: 1, name: 'USA' };
      const mockBand = { id: 1, ...createBandDto, country: mockCountry };

      mockCountriesRepository.findOne.mockResolvedValue(mockCountry);
      mockBandsRepository.create.mockReturnValue(mockBand);
      mockBandsRepository.save.mockResolvedValue(mockBand);

      const result = await service.create(createBandDto);

      expect(mockCountriesRepository.findOne).toHaveBeenCalledWith({
        where: { id: createBandDto.countryId },
      });
      expect(mockBandsRepository.create).toHaveBeenCalledWith({
        ...createBandDto,
        country: mockCountry,
      });
      expect(result).toEqual(mockBand);
    });

    it('should throw error when country not found', async () => {
      const createBandDto: CreateBandDto = {
        name: 'Test Band',
        countryId: 999,
        genre: 'Rock',
        yearFormed: 2020,
      };

      mockCountriesRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createBandDto)).rejects.toThrow(
        'Country with ID 999 not found',
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated bands', async () => {
      const mockBands = [
        { id: 1, name: 'Band 1' },
        { id: 2, name: 'Band 2' },
      ];
      mockBandsRepository.findAllWithRelations.mockResolvedValue(mockBands);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(mockBandsRepository.findAllWithRelations).toHaveBeenCalledWith(
        0,
        10,
      );
      expect(result).toEqual(mockBands);
    });
  });

  describe('findOne', () => {
    it('should return a band by id', async () => {
      const mockBand = { id: 1, name: 'Test Band' };
      mockBandsRepository.findOneWithRelations.mockResolvedValue(mockBand);

      const result = await service.findOne(1);

      expect(mockBandsRepository.findOneWithRelations).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockBand);
    });
  });

  describe('update', () => {
    it('should update a band', async () => {
      const updateBandDto: UpdateBandDto = { name: 'Updated Band' };
      const updatedBand = { id: 1, name: 'Updated Band', version: 1 };
      const mockBand = { id: 1, name: 'Band', version: 1 };

      mockBandsRepository.findOne.mockResolvedValueOnce(mockBand);
      mockBandsRepository.update.mockResolvedValue({ affected: 1 });
      mockBandsRepository.findOneWithRelations.mockResolvedValue(updatedBand);

      const result = await service.update(1, updateBandDto);

      expect(mockBandsRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockBandsRepository.update).toHaveBeenCalledWith(
        { id: 1, version: 1 },
        updateBandDto,
      );
      expect(mockBandsRepository.findOneWithRelations).toHaveBeenCalledWith(1);
      expect(result).toEqual(updatedBand);
    });
  });

  describe('remove', () => {
    it('should soft delete a band idempotently with version check', async () => {
      const updateResult = { affected: 1, raw: [], generatedMaps: [] };
      mockBandsRepository.findOne.mockResolvedValueOnce({
        id: 1,
        version: 1,
        deletedAt: null,
      });
      mockBandsRepository.update.mockResolvedValue(updateResult);

      const result = await service.remove(1);

      expect(mockBandsRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        withDeleted: true,
        select: ['id', 'deletedAt', 'version'],
      });
      expect(mockBandsRepository.update).toHaveBeenCalledWith(
        { id: 1, deletedAt: expect.any(Object), version: 1 },
        { deletedAt: expect.any(Date) },
      );
      expect(result).toEqual(updateResult);
    });
  });

  describe('searchByName', () => {
    it('should find bands by name', async () => {
      const mockBands = [{ id: 1, name: 'Test Band' }];
      mockBandsRepository.findByNamePattern.mockResolvedValue(mockBands);

      const result = await service.searchByName('Test Band');

      expect(mockBandsRepository.findByNamePattern).toHaveBeenCalledWith(
        'Test Band',
      );
      expect(result).toEqual(mockBands);
    });
  });

  describe('searchByFirstLetter', () => {
    it('should find bands by first letter', async () => {
      const mockBands = [{ id: 1, name: 'Test Band' }];
      mockBandsRepository.findByFirstLetter.mockResolvedValue(mockBands);

      const result = await service.searchByFirstLetter('T');

      expect(mockBandsRepository.findByFirstLetter).toHaveBeenCalledWith('T');
      expect(result).toEqual(mockBands);
    });
  });

  describe('findByGenre', () => {
    it('should find bands by genre', async () => {
      const mockBands = [{ id: 1, genre: 'Rock' }];
      mockBandsRepository.findByGenre.mockResolvedValue(mockBands);

      const result = await service.findByGenre('Rock');

      expect(mockBandsRepository.findByGenre).toHaveBeenCalledWith('Rock');
      expect(result).toEqual(mockBands);
    });
  });

  describe('findByYear', () => {
    it('should find bands by year formed', async () => {
      const mockBands = [{ id: 1, yearFormed: 2020 }];
      mockBandsRepository.findByYear.mockResolvedValue(mockBands);

      const result = await service.findByYear(2020);

      expect(mockBandsRepository.findByYear).toHaveBeenCalledWith(2020);
      expect(result).toEqual(mockBands);
    });
  });

  describe('findByCountry', () => {
    it('should find bands by country name', async () => {
      const mockBands = [{ id: 1, country: { name: 'USA' } }];
      mockBandsRepository.findByCountry.mockResolvedValue(mockBands);

      const result = await service.findByCountry('USA');

      expect(mockBandsRepository.findByCountry).toHaveBeenCalledWith('USA');
      expect(result).toEqual(mockBands);
    });
  });
});
