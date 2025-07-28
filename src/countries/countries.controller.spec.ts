import { Test, TestingModule } from '@nestjs/testing';
import { CountriesController } from './countries.controller';
import { CountriesService } from './countries.service';
import { CreateCountryDto } from './dto/create-country.dto';

describe('CountriesController', () => {
  let controller: CountriesController;
  let service: CountriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CountriesController],
      providers: [
        {
          provide: CountriesService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            findByCode: jest.fn(),
            findByName: jest.fn(),
            findByRegion: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            softRemove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CountriesController>(CountriesController);
    service = module.get<CountriesService>(CountriesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call service.create and return the result', async () => {
      const dto: CreateCountryDto = {
        name: 'Argentina',
        code: 'ARG',
        alpha2Code: 'AR',
        numericCode: 32,
        region: 'Americas',
        subregion: 'South America',
        isActive: true,
      };
      const expectedResult = { id: 1, ...dto };
      (service.create as jest.Mock).mockResolvedValue(expectedResult);

      expect(await controller.create(dto)).toEqual(expectedResult);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should call service.findAll with default pagination', async () => {
      const expectedResult = [];
      (service.findAll as jest.Mock).mockResolvedValue(expectedResult);

      expect(await controller.findAll()).toEqual(expectedResult);
      expect(service.findAll).toHaveBeenCalledWith(1, 10);
    });
  });

  describe('findOne', () => {
    it('should call service.findOne and return the result', async () => {
      const id = 1;
      const expectedResult = { id, name: 'Argentina' };
      (service.findOne as jest.Mock).mockResolvedValue(expectedResult);

      expect(await controller.findOne(id)).toEqual(expectedResult);
      expect(service.findOne).toHaveBeenCalledWith(id);
    });
  });

  describe('findByCode', () => {
    it('should call service.findByCode and return the result', async () => {
      const code = 'ARG';
      const expectedResult = { id: 1, code, name: 'Argentina' };
      (service.findByCode as jest.Mock).mockResolvedValue(expectedResult);

      expect(await controller.findByCode(code)).toEqual(expectedResult);
      expect(service.findByCode).toHaveBeenCalledWith(code);
    });
  });
});
