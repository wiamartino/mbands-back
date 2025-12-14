import { Repository, DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { Album } from './entities/album.entity';

@Injectable()
export class AlbumsRepository extends Repository<Album> {
  constructor(private dataSource: DataSource) {
    super(Album, dataSource.createEntityManager());
  }

  /**
   * Find all albums with relations
   */
  async findAllWithRelations(skip: number, take: number): Promise<Album[]> {
    return this.find({
      skip,
      take,
      relations: {
        band: {
          country: true,
        },
        songs: true,
      },
    });
  }

  /**
   * Find one album with relations
   */
  async findOneWithRelations(id: number): Promise<Album | null> {
    return this.findOne({
      where: { id },
      relations: {
        band: {
          country: true,
          members: true,
        },
        songs: true,
      },
    });
  }

  /**
   * Find albums by band
   */
  async findByBand(bandId: number): Promise<Album[]> {
    return this.find({
      where: { band: { id: bandId } },
      relations: ['band', 'songs'],
      order: { releaseDate: 'DESC' },
    });
  }

  /**
   * Find albums by year
   */
  async findByYear(year: number): Promise<Album[]> {
    return this.createQueryBuilder('album')
      .where('EXTRACT(YEAR FROM album.releaseDate) = :year', { year })
      .leftJoinAndSelect('album.band', 'band')
      .leftJoinAndSelect('album.songs', 'songs')
      .orderBy('album.releaseDate', 'DESC')
      .getMany();
  }

  /**
   * Search albums by title
   */
  async searchByTitle(pattern: string): Promise<Album[]> {
    return this.createQueryBuilder('album')
      .where('LOWER(album.title) LIKE LOWER(:pattern)', {
        pattern: `%${pattern}%`,
      })
      .leftJoinAndSelect('album.band', 'band')
      .leftJoinAndSelect('album.songs', 'songs')
      .orderBy('album.releaseDate', 'DESC')
      .getMany();
  }
}
