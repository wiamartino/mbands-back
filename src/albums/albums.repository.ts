import { Repository, DataSource } from 'typeorm';
import { Album } from './entities/album.entity';

export class AlbumsRepository extends Repository<Album> {
  constructor(private dataSource: DataSource) {
    super(Album, dataSource.createEntityManager());
  }
}
