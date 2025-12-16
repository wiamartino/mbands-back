import { Repository, DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { Song } from './entities/song.entity';

@Injectable()
export class SongsRepository extends Repository<Song> {
  constructor(private dataSource: DataSource) {
    super(Song, dataSource.createEntityManager());
  }

  /**
   * Find all songs with relations
   */
  async findAllWithRelations(skip: number, take: number): Promise<Song[]> {
    return this.find({
      skip,
      take,
      relations: {
        band: {
          country: true,
        },
        albums: {
          band: true,
        },
      },
    });
  }

  /**
   * Find one song with relations
   */
  async findOneWithRelations(id: number): Promise<Song | null> {
    return this.findOne({
      where: { id },
      relations: {
        band: {
          country: true,
        },
        albums: {
          band: true,
        },
      },
    });
  }

  /**
   * Find songs by band
   */
  async findByBand(bandId: number): Promise<Song[]> {
    return this.find({
      where: { band: { id: bandId } },
      relations: ['band', 'albums'],
    });
  }

  /**
   * Find songs by album
   */
  async findByAlbum(albumId: number): Promise<Song[]> {
    return this.createQueryBuilder('song')
      .leftJoin('song.albums', 'album')
      .where('album.id = :albumId', { albumId })
      .leftJoinAndSelect('song.band', 'band')
      .orderBy('song.trackNumber', 'ASC')
      .getMany();
  }

  /**
   * Search songs by title
   */
  async searchByTitle(pattern: string): Promise<Song[]> {
    return this.createQueryBuilder('song')
      .where('LOWER(song.title) LIKE LOWER(:pattern)', {
        pattern: `%${pattern}%`,
      })
      .leftJoinAndSelect('song.band', 'band')
      .leftJoinAndSelect('song.albums', 'albums')
      .getMany();
  }
}
