import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { CreateBandDto } from './dto/create-band.dto';
import { UpdateBandDto } from './dto/update-band.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Band } from './entities/band.entity';
import { Country } from '../countries/entities/country.entity';
import { Repository, UpdateResult, DataSource } from 'typeorm';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { buildPaginationParams } from '../common/pagination';
import { BandsRepository } from './bands.repository';

@Injectable()
export class BandsService {
  constructor(
    private readonly bandsRepository: BandsRepository,
    @InjectRepository(Country)
    private readonly countriesRepository: Repository<Country>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createBandDto: CreateBandDto): Promise<Band> {
    const country = await this.countriesRepository.findOne({
      where: { id: createBandDto.countryId },
    });

    if (!country) {
      throw new Error(`Country with ID ${createBandDto.countryId} not found`);
    }

    const band = this.bandsRepository.create({
      ...createBandDto,
      country,
    });
    return this.bandsRepository.save(band);
  }

  async findAll(pagination?: PaginationQueryDto): Promise<Band[]> {
    const { skip, take } = buildPaginationParams(pagination);
    return this.bandsRepository.findAllWithRelations(skip, take);
  }

  async findOne(id: number): Promise<Band> {
    return this.bandsRepository.findOneWithRelations(id);
  }

  async update(id: number, updateBandDto: UpdateBandDto): Promise<Band> {
    const band = await this.bandsRepository.findOne({ where: { id } });
    if (!band) {
      throw new NotFoundException('Band not found');
    }

    try {
      // Optimistic locking: TypeORM will check version automatically
      const result = await this.bandsRepository.update(
        { id, version: band.version },
        updateBandDto,
      );

      if (result.affected === 0) {
        throw new ConflictException(
          'Band was modified by another user. Please refresh and try again.',
        );
      }

      return this.findOne(id);
    } catch (error: any) {
      // Catch optimistic lock version mismatch errors
      if (error.message?.includes('version') || error.code === '23505') {
        throw new ConflictException(
          'Band was modified by another user. Please refresh and try again.',
        );
      }
      throw error;
    }
  }

  async remove(id: number): Promise<UpdateResult> {
    return this.bandsRepository.softDelete(id);
  }

  async searchByName(name: string): Promise<Band[]> {
    return this.bandsRepository.findByNamePattern(name);
  }

  async searchByFirstLetter(firstLetter: string): Promise<Band[]> {
    return this.bandsRepository.findByFirstLetter(firstLetter);
  }

  async findByGenre(genre: string): Promise<Band[]> {
    return this.bandsRepository.findByGenre(genre);
  }

  async findByYear(year: number): Promise<Band[]> {
    return this.bandsRepository.findByYear(year);
  }

  async findByCountry(countryName: string): Promise<Band[]> {
    return this.bandsRepository.findByCountry(countryName);
  }
}
