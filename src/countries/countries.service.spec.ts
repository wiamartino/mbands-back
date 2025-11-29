import { Test, TestingModule } from '@nestjs/testing';
import { CountriesService } from './countries.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Country } from './entities/country.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

describe('CountriesService', () => {
  let service: CountriesService;
  let repository: Repository<Country>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CountriesService,
        {
          provide: getRepositoryToken(Country),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CountriesService>(CountriesService);
    repository = module.get<Repository<Country>>(getRepositoryToken(Country));
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

      jest.spyOn(repository, 'create').mockReturnValue(country as Country);
      jest.spyOn(repository, 'save').mockResolvedValue(country as Country);

      expect(await service.create(createCountryDto)).toEqual(country);
      expect(repository.create).toHaveBeenCalledWith(createCountryDto);
      expect(repository.save).toHaveBeenCalledWith(country);
    });
  });

  describe('findOne', () => {
    it('should return a country when found', async () => {
      const country = { id: 1, name: 'Argentina', isActive: true };
      jest.spyOn(repository, 'findOne').mockResolvedValue(country as Country);

      expect(await service.findOne(1)).toEqual(country);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 1, isActive: true },
        relations: {
          bands: {
            albums: true,
            members: true,
          },
          events: {
            band: true,
          },
        },
      });
    });

    it('should throw NotFoundException when country not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });
});
