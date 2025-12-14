import { Test, TestingModule } from '@nestjs/testing';
import { CountriesService } from './countries.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Country } from './entities/country.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { CountriesRepository } from './countries.repository';

describe('CountriesService', () => {
  let service: CountriesService;
  let repository: CountriesRepository;

  const mockCountriesRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findOneActive: jest.fn(),
    findAllActive: jest.fn(),
    findByName: jest.fn(),
    findByCode: jest.fn(),
    searchByName: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    softDelete: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CountriesService,
        {
          provide: CountriesRepository,
          useValue: mockCountriesRepository,
        },
      ],
    }).compile();

    service = module.get<CountriesService>(CountriesService);
    repository = module.get<CountriesRepository>(CountriesRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and return a country', async () => {
      const createCountryDto = {
        name: 'Argentina',
        code: 'ARG',
        alpha2Code: 'AR',
        numericCode: 32,
        region: 'Americas',
        subregion: 'South America',
      };
      const country = { id: 1, ...createCountryDto };

      mockCountriesRepository.create.mockReturnValue(country as Country);
      mockCountriesRepository.save.mockResolvedValue(country as Country);

      expect(await service.create(createCountryDto)).toEqual(country);
      expect(mockCountriesRepository.create).toHaveBeenCalledWith(
        createCountryDto,
      );
      expect(mockCountriesRepository.save).toHaveBeenCalledWith(country);
    });
  });

  describe('findOne', () => {
    it('should return a country when found', async () => {
      const country = { id: 1, name: 'Argentina', isActive: true };
      mockCountriesRepository.findOneActive.mockResolvedValue(
        country as Country,
      );

      expect(await service.findOne(1)).toEqual(country);
      expect(mockCountriesRepository.findOneActive).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when country not found', async () => {
      mockCountriesRepository.findOneActive.mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });
});
