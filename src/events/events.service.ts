import { Injectable } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Event } from './entities/event.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { buildPaginationParams } from '../common/pagination';

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
      relations: ['band'],
    });
  }

  findOne(id: number) {
    return this.eventsRepository.findOne({
      where: { id },
      relations: ['band'],
    });
  }

  update(id: number, updateEventDto: UpdateEventDto) {
    return this.eventsRepository.update(id, updateEventDto);
  }

  async remove(id: number): Promise<UpdateResult> {
    return this.eventsRepository.softDelete(id);
  }
}
