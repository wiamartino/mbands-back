import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Event } from './entities/event.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { buildPaginationParams } from '../common/pagination';
import { idempotentSoftDelete } from '../common/soft-delete';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventsRepository: Repository<Event>,
  ) {}

  create(createEventDto: CreateEventDto) {
    const event = this.eventsRepository.create(createEventDto);
    return this.eventsRepository.save(event);
  }

  async findAll(pagination?: PaginationQueryDto) {
    const { skip, take } = buildPaginationParams(pagination);

    return this.eventsRepository.find({
      skip,
      take,
      order: { createdAt: 'ASC', id: 'ASC' },
      relations: ['band'],
    });
  }

  findOne(id: number) {
    return this.eventsRepository.findOne({
      where: { id },
      relations: ['band'],
    });
  }

  async update(id: number, updateEventDto: UpdateEventDto): Promise<Event> {
    const event = await this.eventsRepository.findOne({ where: { id } });
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    try {
      // Optimistic locking: TypeORM will check version automatically
      const result = await this.eventsRepository.update(
        { id, version: event.version },
        updateEventDto,
      );

      if (result.affected === 0) {
        throw new ConflictException(
          'Event was modified by another user. Please refresh and try again.',
        );
      }

      return this.findOne(id);
    } catch (error: any) {
      if (error.message?.includes('version') || error.code === '23505') {
        throw new ConflictException(
          'Event was modified by another user. Please refresh and try again.',
        );
      }
      throw error;
    }
  }

  async remove(id: number): Promise<UpdateResult> {
    return idempotentSoftDelete(this.eventsRepository, id);
  }
}
