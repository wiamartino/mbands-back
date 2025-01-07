import { Injectable } from '@nestjs/common';
import { CreateBandDto } from './dto/create-band.dto';
import { UpdateBandDto } from './dto/update-band.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Band } from './entities/band.entity';
import { DeleteResult, Repository } from 'typeorm';

@Injectable()
export class BandsService {
  constructor(
    @InjectRepository(Band)
    private readonly bandsRepository: Repository<Band>,
  ) {}

  async create(createBandDto: CreateBandDto): Promise<Band> {
    const band = this.bandsRepository.create(createBandDto);
    return this.bandsRepository.save(band);
  }

  async findAll(page: number, limit: number): Promise<Band[]> {
    return this.bandsRepository.find({
      skip: (page - 1) * limit,
      take: limit,
      relations: ['members', 'albums'],
    });
  }

  async findOne(id: number): Promise<Band> {
    return this.bandsRepository.findOne({
      where: { id },
      relations: ['members', 'albums'],
    });
  }

  async update(id: number, updateBandDto: UpdateBandDto): Promise<Band> {
    await this.bandsRepository.update(id, updateBandDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<DeleteResult> {
    return this.bandsRepository.delete(id);
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
}
