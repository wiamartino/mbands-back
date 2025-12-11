import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { Event } from './entities/event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

const mockEventsRepository = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const mockEventsService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('EventsController', () => {
  let controller: EventsController;
  let service: EventsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventsController],
      providers: [
        {
          provide: EventsService,
          useValue: mockEventsService,
        },
        {
          provide: getRepositoryToken(Event),
          useValue: mockEventsRepository,
        },
      ],
    }).compile();

    controller = module.get<EventsController>(EventsController);
    service = module.get<EventsService>(EventsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create an event', async () => {
      const createEventDto: CreateEventDto = {
        title: 'Test Event',
        description: 'Test Description',
        date: '2023-06-15T20:00:00.000Z',
        bandId: 1,
      };
      const result = { id: 1, ...createEventDto };

      mockEventsService.create.mockResolvedValue(result);

      expect(await controller.create(createEventDto)).toBe(result);
      expect(service.create).toHaveBeenCalledWith(createEventDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of events', async () => {
      const result = [
        { id: 1, title: 'Event 1' },
        { id: 2, title: 'Event 2' },
      ];

      mockEventsService.findAll.mockResolvedValue(result);

      expect(await controller.findAll()).toBe(result);
      expect(service.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1, limit: 10 }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a single event', async () => {
      const result = { id: 1, title: 'Event 1' };

      mockEventsService.findOne.mockResolvedValue(result);

      expect(await controller.findOne('1')).toBe(result);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should update an event', async () => {
      const updateEventDto: UpdateEventDto = { title: 'Updated Event' };
      const result = { affected: 1 };

      mockEventsService.update.mockResolvedValue(result);

      expect(await controller.update('1', updateEventDto)).toBe(result);
      expect(service.update).toHaveBeenCalledWith(1, updateEventDto);
    });
  });

  describe('remove', () => {
    it('should remove an event', async () => {
      mockEventsService.remove.mockResolvedValue(undefined);

      expect(await controller.remove('1')).toBeUndefined();
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
});
