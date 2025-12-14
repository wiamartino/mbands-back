import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCountryDto } from './dto/create-country.dto';
import { UpdateCountryDto } from './dto/update-country.dto';
import { Country } from './entities/country.entity';
import { UpdateResult } from 'typeorm';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { buildPaginationParams } from '../common/pagination';
import { CountriesRepository } from './countries.repository';

@Injectable()
export class CountriesService {
  constructor(private readonly countriesRepository: CountriesRepository) {}

  async create(createCountryDto: CreateCountryDto): Promise<Country> {
    const country = this.countriesRepository.create(createCountryDto);
    return this.countriesRepository.save(country);
  }

  async findAll(pagination?: PaginationQueryDto): Promise<Country[]> {
    const { skip, take } = buildPaginationParams(pagination);
    return this.countriesRepository.findAllActive(skip, take);
  }

  async findOne(id: number): Promise<Country> {
    const country = await this.countriesRepository.findOneActive(id);

    if (!country) {
      throw new NotFoundException(`Country with ID ${id} not found`);
    }

    return country;
  }

  async findByCode(code: string): Promise<Country> {
    const country = await this.countriesRepository.findByCode(
      code.toUpperCase(),
    );

    if (!country || !country.isActive) {
      throw new NotFoundException(`Country with code ${code} not found`);
    }

    return country;
  }

  async findByName(name: string): Promise<Country[]> {
    return this.countriesRepository.searchByName(name);
  }

  async findByRegion(region: string): Promise<Country[]> {
    return this.countriesRepository.find({
      where: { region, isActive: true },
      relations: ['bands', 'events'],
    });
  }

  async update(
    id: number,
    updateCountryDto: UpdateCountryDto,
  ): Promise<Country> {
    await this.findOne(id);
    await this.countriesRepository.update(id, updateCountryDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<UpdateResult> {
    await this.findOne(id);
    return this.countriesRepository.softDelete(id);
  }

  async softRemove(id: number): Promise<Country> {
    const country = await this.findOne(id);
    country.isActive = false;
    return this.countriesRepository.save(country);
  }
}
