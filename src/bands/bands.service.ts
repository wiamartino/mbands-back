import { Injectable } from '@nestjs/common';
import { CreateBandDto } from './dto/create-band.dto';
import { UpdateBandDto } from './dto/update-band.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Band } from './entities/band.entity';
import { Country } from '../countries/entities/country.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';

@Injectable()
export class BandsService {
  constructor(
    @InjectRepository(Band)
    private readonly bandsRepository: Repository<Band>,
    @InjectRepository(Country)
    private readonly countriesRepository: Repository<Country>,
  ) { }

  async create(createBandDto: CreateBandDto): Promise<Band> {
    const country = await this.countriesRepository.findOne({
      where: { id: createBandDto.countryId }
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

  async findAll(page: number, limit: number): Promise<Band[]> {
    return this.bandsRepository.find({
      skip: (page - 1) * limit,
      take: limit,
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

  async findOne(id: number): Promise<Band> {
    return this.bandsRepository.findOne({
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

  async update(id: number, updateBandDto: UpdateBandDto): Promise<Band> {
    await this.bandsRepository.update(id, updateBandDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<UpdateResult> {
    return this.bandsRepository.softDelete(id);
  }

  async searchByName(name: string): Promise<Band[]> {
    return this.bandsRepository.find({
      where: { name: name },
      relations: ['members', 'albums'],
    });
  }

  async searchByFirstLetter(firstLetter: string): Promise<Band[]> {
    return this.bandsRepository
      .createQueryBuilder('band')
      .where('band.name LIKE :firstLetter', { firstLetter: `${firstLetter}%` })
      .getMany();
  }

  async findByGenre(genre: string): Promise<Band[]> {
    return this.bandsRepository.find({
      where: { genre },
      relations: ['members', 'albums'],
    });
  }

  async findByYear(year: number): Promise<Band[]> {
    return this.bandsRepository.find({
      where: { yearFormed: year },
      relations: ['members', 'albums'],
    });
  }

  async findByCountry(countryName: string): Promise<Band[]> {
    return this.bandsRepository.find({
      where: {
        country: {
          name: countryName
        }
      },
      relations: ['members', 'albums', 'country'],
    });
  }
}
