import { Repository, DataSource } from 'typeorm';
import { Song } from './entities/song.entity';

export class SongsRepository extends Repository<Song> {
  constructor(private dataSource: DataSource) {
    super(Song, dataSource.createEntityManager());
  }
}
