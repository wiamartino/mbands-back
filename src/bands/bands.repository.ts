import { Repository, DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { Band } from './entities/band.entity';

@Injectable()
export class BandsRepository extends Repository<Band> {
  constructor(private dataSource: DataSource) {
    super(Band, dataSource.createEntityManager());
  }

  /**
   * Find bands by name pattern (case-insensitive)
   */
  async findByNamePattern(pattern: string): Promise<Band[]> {
    return this.createQueryBuilder('band')
      .where('LOWER(band.name) LIKE LOWER(:pattern)', {
        pattern: `%${pattern}%`,
      })
      .leftJoinAndSelect('band.country', 'country')
      .leftJoinAndSelect('band.members', 'members')
      .leftJoinAndSelect('band.albums', 'albums')
      .getMany();
  }

  /**
   * Find bands by first letter
   */
  async findByFirstLetter(letter: string): Promise<Band[]> {
    return this.createQueryBuilder('band')
      .where('band.name LIKE :letter', { letter: `${letter}%` })
      .leftJoinAndSelect('band.country', 'country')
      .orderBy('band.name', 'ASC')
      .getMany();
  }

  /**
   * Find bands by genre
   */
  async findByGenre(genre: string): Promise<Band[]> {
    return this.find({
      where: { genre },
      relations: ['country', 'members', 'albums'],
    });
  }

  /**
   * Find bands by formation year
   */
  async findByYear(year: number): Promise<Band[]> {
    return this.find({
      where: { yearFormed: year },
      relations: ['country', 'members', 'albums'],
    });
  }

  /**
   * Find bands by country
   */
  async findByCountry(countryName: string): Promise<Band[]> {
    return this.find({
      where: {
        country: {
          name: countryName,
        },
      },
      relations: ['country', 'members', 'albums'],
    });
  }

  /**
   * Find one band with all relations
   */
  async findOneWithRelations(id: number): Promise<Band | null> {
    return this.findOne({
      where: { id },
      relations: {
        country: true,
        members: true,
        albums: {
          songs: true,
        },
        events: true,
        songs: true,
      },
    });
  }

  /**
   * Find all bands with pagination and relations
   */
  async findAllWithRelations(skip: number, take: number): Promise<Band[]> {
    return this.find({
      skip,
      take,
      relations: {
        country: true,
        members: true,
        albums: {
          songs: true,
        },
        events: true,
        songs: true,
      },
    });
  }
}
