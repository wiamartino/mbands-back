import { Test, TestingModule } from '@nestjs/testing';
import { BandsController } from './bands.controller';
import { BandsService } from './bands.service';
import { CreateBandDto } from './dto/create-band.dto';
import { UpdateBandDto } from './dto/update-band.dto';

describe('BandsController', () => {
  let controller: BandsController;
  let service: BandsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BandsController],
      providers: [
        {
          provide: BandsService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            searchByName: jest.fn(),
            searchByFirstLetter: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<BandsController>(BandsController);
    service = module.get<BandsService>(BandsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call service.create and return the result', async () => {
      const dto: CreateBandDto = {
        name: 'Rata Blanca',
        genre: 'Heavy metal',
        yearFormed: 1985,
        country: 'Argentina'
      };
      (service.create as jest.Mock).mockResolvedValue({ id: 1, ...dto });
      expect(await controller.create(dto)).toEqual({ id: 1, ...dto });
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should call service.findAll with default params', async () => {
      (service.findAll as jest.Mock).mockResolvedValue([]);
      expect(await controller.findAll()).toEqual([]);
      expect(service.findAll).toHaveBeenCalledWith(1, 10);
    });
  });

  describe('findOne', () => {
    it('should return a band if found', async () => {
      (service.findOne as jest.Mock).mockResolvedValue({ id: 1, name: 'Test' });
      expect(await controller.findOne('1')).toEqual({ id: 1, name: 'Test' });
      expect(service.findOne).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if not found', async () => {
      (service.findOne as jest.Mock).mockResolvedValue(null);
      await expect(controller.findOne('1')).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('should call service.update and return the updated band', async () => {
      const dto: UpdateBandDto = { name: 'Updated' };
      (service.update as jest.Mock).mockResolvedValue({ id: 1, ...dto });
      expect(await controller.update('1', dto)).toEqual({ id: 1, ...dto });
      expect(service.update).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('remove', () => {
    it('should call service.remove and return the result', async () => {
      (service.remove as jest.Mock).mockResolvedValue({ deleted: true });
      expect(await controller.remove('1')).toEqual({ deleted: true });
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });

  describe('searchByName', () => {
    it('should call service.searchByName with the provided name', async () => {
      (service.searchByName as jest.Mock).mockResolvedValue([{ id: 2 }]);
      expect(await controller.searchByName('foo')).toEqual([{ id: 2 }]);
      expect(service.searchByName).toHaveBeenCalledWith('foo');
    });
  });

  describe('searchByFirstLetter', () => {
    it('should call service.searchByFirstLetter with the provided letter', async () => {
      (service.searchByFirstLetter as jest.Mock).mockResolvedValue([{ id: 3 }]);
      expect(await controller.searchByFirstLetter('b')).toEqual([{ id: 3 }]);
      expect(service.searchByFirstLetter).toHaveBeenCalledWith('b');
    });
  });
});
