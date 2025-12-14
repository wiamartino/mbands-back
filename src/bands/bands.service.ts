import { Injectable } from '@nestjs/common';
import { CreateBandDto } from './dto/create-band.dto';
import { UpdateBandDto } from './dto/update-band.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Band } from './entities/band.entity';
import { Country } from '../countries/entities/country.entity';
import { Repository, UpdateResult } from 'typeorm';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { buildPaginationParams } from '../common/pagination';
import { BandsRepository } from './bands.repository';

@Injectable()
export class BandsService {
  constructor(
    private readonly bandsRepository: BandsRepository,
    @InjectRepository(Country)
    private readonly countriesRepository: Repository<Country>,
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
    await this.bandsRepository.update(id, updateBandDto);
    return this.findOne(id);
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
