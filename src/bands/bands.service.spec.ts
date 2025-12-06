import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DeleteResult } from 'typeorm';
import { BandsService } from './bands.service';
import { Band } from './entities/band.entity';
import { Country } from '../countries/entities/country.entity';
import { CreateBandDto } from './dto/create-band.dto';
import { UpdateBandDto } from './dto/update-band.dto';

describe('BandsService', () => {
  let service: BandsService;
  let bandsRepository: Repository<Band>;
  let countriesRepository: Repository<Country>;

  const mockBandsRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BandsService,
        {
          provide: getRepositoryToken(Band),
          useValue: mockBandsRepository,
        },
        {
          provide: getRepositoryToken(Country),
          useValue: mockCountriesRepository,
        },
      ],
    }).compile();

    service = module.get<BandsService>(BandsService);
    bandsRepository = module.get<Repository<Band>>(getRepositoryToken(Band));
    countriesRepository = module.get<Repository<Country>>(getRepositoryToken(Country));
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
        where: { id: createBandDto.countryId }
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

      await expect(service.create(createBandDto)).rejects.toThrow('Country with ID 999 not found');
    });
  });

  describe('findAll', () => {
    it('should return paginated bands', async () => {
      const mockBands = [{ id: 1, name: 'Band 1' }, { id: 2, name: 'Band 2' }];
      mockBandsRepository.find.mockResolvedValue(mockBands);

      const result = await service.findAll(1, 10);

      expect(mockBandsRepository.find).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        relations: {
          country: true,
          members: true,
          albums: {
            songs: true,
          },
          events: true,
          songs: true,
        },
      });
      expect(result).toEqual(mockBands);
    });
  });

  describe('findOne', () => {
    it('should return a band by id', async () => {
      const mockBand = { id: 1, name: 'Test Band' };
      mockBandsRepository.findOne.mockResolvedValue(mockBand);

      const result = await service.findOne(1);

      expect(mockBandsRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: {
          country: true,
          members: true,
          albums: {
            songs: true,
          },
          events: true,
          songs: true,
        },
      });
      expect(result).toEqual(mockBand);
    });
  });

  describe('update', () => {
    it('should update a band', async () => {
      const updateBandDto: UpdateBandDto = { name: 'Updated Band' };
      const updatedBand = { id: 1, name: 'Updated Band' };

      mockBandsRepository.update.mockResolvedValue({ affected: 1 });
      jest.spyOn(service, 'findOne').mockResolvedValue(updatedBand as Band);

      const result = await service.update(1, updateBandDto);

      expect(mockBandsRepository.update).toHaveBeenCalledWith(1, updateBandDto);
      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(updatedBand);
    });
  });

  describe('remove', () => {
    it('should delete a band', async () => {
      const deleteResult: DeleteResult = { affected: 1, raw: {} };
      mockBandsRepository.softDelete.mockResolvedValue(deleteResult);

      const result = await service.remove(1);

      expect(mockBandsRepository.softDelete).toHaveBeenCalledWith(1);
      expect(result).toEqual(deleteResult);
    });
  });

  describe('searchByName', () => {
    it('should find bands by name', async () => {
      const mockBands = [{ id: 1, name: 'Test Band' }];
      mockBandsRepository.find.mockResolvedValue(mockBands);

      const result = await service.searchByName('Test Band');

      expect(mockBandsRepository.find).toHaveBeenCalledWith({
        where: { name: 'Test Band' },
        relations: ['members', 'albums'],
      });
      expect(result).toEqual(mockBands);
    });
  });

  describe('searchByFirstLetter', () => {
    it('should find bands by first letter', async () => {
      const mockBands = [{ id: 1, name: 'Test Band' }];
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockBands),
      };
      mockBandsRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.searchByFirstLetter('T');

      expect(mockBandsRepository.createQueryBuilder).toHaveBeenCalledWith('band');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'band.name LIKE :firstLetter',
        { firstLetter: 'T%' }
      );
      expect(result).toEqual(mockBands);
    });
  });

  describe('findByGenre', () => {
    it('should find bands by genre', async () => {
      const mockBands = [{ id: 1, genre: 'Rock' }];
      mockBandsRepository.find.mockResolvedValue(mockBands);

      const result = await service.findByGenre('Rock');

      expect(mockBandsRepository.find).toHaveBeenCalledWith({
        where: { genre: 'Rock' },
        relations: ['members', 'albums'],
      });
      expect(result).toEqual(mockBands);
    });
  });

  describe('findByYear', () => {
    it('should find bands by year formed', async () => {
      const mockBands = [{ id: 1, yearFormed: 2020 }];
      mockBandsRepository.find.mockResolvedValue(mockBands);

      const result = await service.findByYear(2020);

      expect(mockBandsRepository.find).toHaveBeenCalledWith({
        where: { yearFormed: 2020 },
        relations: ['members', 'albums'],
      });
      expect(result).toEqual(mockBands);
    });
  });

  describe('findByCountry', () => {
    it('should find bands by country name', async () => {
      const mockBands = [{ id: 1, country: { name: 'USA' } }];
      mockBandsRepository.find.mockResolvedValue(mockBands);

      const result = await service.findByCountry('USA');

      expect(mockBandsRepository.find).toHaveBeenCalledWith({
        where: {
          country: {
            name: 'USA'
          }
        },
        relations: ['members', 'albums', 'country'],
      });
      expect(result).toEqual(mockBands);
    });
  });
});
