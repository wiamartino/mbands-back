import { Repository, DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { Country } from './entities/country.entity';

@Injectable()
export class CountriesRepository extends Repository<Country> {
  constructor(private dataSource: DataSource) {
    super(Country, dataSource.createEntityManager());
  }

  /**
   * Find all active countries with relations
   */
  async findAllActive(skip: number, take: number): Promise<Country[]> {
    return this.find({
      skip,
      take,
      relations: {
        bands: {
          albums: true,
          members: true,
        },
        events: {
          band: true,
        },
      },
      where: { isActive: true },
    });
  }

  /**
   * Find one active country with relations
   */
  async findOneActive(id: number): Promise<Country | null> {
    return this.findOne({
      where: { id, isActive: true },
      relations: {
        bands: {
          albums: true,
          members: true,
        },
        events: {
          band: true,
        },
      },
    });
  }

  /**
   * Find country by name
   */
  async findByName(name: string): Promise<Country | null> {
    return this.findOne({
      where: { name },
    });
  }

  /**
   * Find country by code
   */
  async findByCode(code: string): Promise<Country | null> {
    return this.findOne({
      where: { code },
    });
  }

  /**
   * Search countries by name pattern
   */
  async searchByName(pattern: string): Promise<Country[]> {
    return this.createQueryBuilder('country')
      .where('LOWER(country.name) LIKE LOWER(:pattern)', { pattern: `%${pattern}%` })
      .andWhere('country.isActive = :isActive', { isActive: true })
      .orderBy('country.name', 'ASC')
      .getMany();
  }
}
