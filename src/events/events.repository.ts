import { Repository, DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { Event } from './entities/event.entity';

@Injectable()
export class EventsRepository extends Repository<Event> {
  constructor(private dataSource: DataSource) {
    super(Event, dataSource.createEntityManager());
  }

  /**
   * Find all events with relations
   */
  async findAllWithRelations(skip: number, take: number): Promise<Event[]> {
    return this.find({
      skip,
      take,
      relations: {
        band: {
          country: true,
        },
        country: true,
      },
      order: { date: 'DESC' },
    });
  }

  /**
   * Find one event with relations
   */
  async findOneWithRelations(id: number): Promise<Event | null> {
    return this.findOne({
      where: { id },
      relations: {
        band: {
          country: true,
          members: true,
        },
        country: true,
      },
    });
  }

  /**
   * Find events by band
   */
  async findByBand(bandId: number): Promise<Event[]> {
    return this.find({
      where: { band: { id: bandId } },
      relations: ['band', 'country'],
      order: { date: 'DESC' },
    });
  }

  /**
   * Find upcoming events
   */
  async findUpcoming(): Promise<Event[]> {
    return this.createQueryBuilder('event')
      .where('event.date >= :now', { now: new Date() })
      .leftJoinAndSelect('event.band', 'band')
      .leftJoinAndSelect('event.country', 'country')
      .orderBy('event.date', 'ASC')
      .getMany();
  }

  /**
   * Find events by date range
   */
  async findByDateRange(startDate: Date, endDate: Date): Promise<Event[]> {
    return this.createQueryBuilder('event')
      .where('event.date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .leftJoinAndSelect('event.band', 'band')
      .leftJoinAndSelect('event.country', 'country')
      .orderBy('event.date', 'ASC')
      .getMany();
  }

  /**
   * Find events by country
   */
  async findByCountry(countryId: number): Promise<Event[]> {
    return this.find({
      where: { country: { id: countryId } },
      relations: ['band', 'country'],
      order: { date: 'DESC' },
    });
  }
}
