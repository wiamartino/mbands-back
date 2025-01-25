import { Repository, DataSource } from 'typeorm';
import { Event } from './entities/event.entity';

export class EventsRepository extends Repository<Event> {
  constructor(private dataSource: DataSource) {
    super(Event, dataSource.createEntityManager());
  }
}
