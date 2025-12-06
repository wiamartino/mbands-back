import { Test, TestingModule } from '@nestjs/testing';
import { EventsService } from './events.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Event } from './entities/event.entity';
import { Repository } from 'typeorm';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

describe('EventsService', () => {
  let service: EventsService;
  let repository: Repository<Event>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    softDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        {
          provide: getRepositoryToken(Event),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
    repository = module.get<Repository<Event>>(getRepositoryToken(Event));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and save an event', async () => {
      const createEventDto: CreateEventDto = {
        title: 'Test Event',
        description: 'Test Description',
        date: '2023-06-15T20:00:00.000Z',
        bandId: 1
      };
      const mockEvent = { id: 1, ...createEventDto };

      mockRepository.create.mockReturnValue(mockEvent);
      mockRepository.save.mockResolvedValue(mockEvent);

      const result = await service.create(createEventDto);

      expect(mockRepository.create).toHaveBeenCalledWith(createEventDto);
      expect(mockRepository.save).toHaveBeenCalledWith(mockEvent);
      expect(result).toEqual(mockEvent);
    });
  });

  describe('findAll', () => {
    it('should return all events with band relations', async () => {
      const mockEvents = [{ id: 1, title: 'Event 1' }, { id: 2, title: 'Event 2' }];
      mockRepository.find.mockResolvedValue(mockEvents);

      const result = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalledWith({ relations: ['band'] });
      expect(result).toEqual(mockEvents);
    });
  });

  describe('findOne', () => {
    it('should return a single event with band relations', async () => {
      const mockEvent = { id: 1, title: 'Event 1' };
      mockRepository.findOne.mockResolvedValue(mockEvent);

      const result = await service.findOne(1);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['band'],
      });
      expect(result).toEqual(mockEvent);
    });
  });

  describe('update', () => {
    it('should update an event', async () => {
      const updateEventDto: UpdateEventDto = { title: 'Updated Event' };
      const updateResult = { affected: 1 };
      mockRepository.update.mockResolvedValue(updateResult);

      const result = await service.update(1, updateEventDto);

      expect(mockRepository.update).toHaveBeenCalledWith(1, updateEventDto);
      expect(result).toEqual(updateResult);
    });
  });

  describe('remove', () => {
    it('should delete an event', async () => {
      mockRepository.softDelete.mockResolvedValue({ affected: 1 });

      await service.remove(1);

      expect(mockRepository.softDelete).toHaveBeenCalledWith(1);
    });
  });
});
